import algosdk from 'algosdk';
import { walletService, WalletAccount, algodClient } from './wallet-service';

declare const Buffer: any;

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const RESOLVER_BASE_URL =
  (import.meta as any)?.env?.VITE_RESOLVER_BASE_URL ||
  'https://hackseries-dynamic-scan.vercel.app';

const DEFAULT_APP_ID = Number(
  ((import.meta as any)?.env?.VITE_DYNAQR_APP_ID ||
    (import.meta as any)?.env?.VITE_ALGORAND_APP_ID ||
    0) as string
);

const DYNAQR_CONTRACT = {
  methods: {
    CREATE_EVENT: 'create_event',
    UPDATE_URL: 'update_url',
    GET_EVENT: 'get_event',
    DEACTIVATE_EVENT: 'deactivate_event',
    INCREMENT_SCAN: 'increment_scan',
    REGISTER_EVENT: 'register_event',
    CONFIRM_ATTENDANCE: 'confirm_attendance',
    MINT_NFT: 'mint_nft',
    UPDATE_TICKET_PRICE: 'update_ticket_price',
    REFUND_REGISTRATION: 'refund_registration'
  }
};

const EVENT_GLOBAL_SUFFIXES = [
  'event_name',
  'current_url',
  'access_type',
  'expiry_date',
  'created_at',
  'owner',
  'scan_count',
  'active',
  'ticket_price',
  'max_capacity',
  'registered_count',
  'nft_asset_id'
];

const REGISTRATION_SUFFIXES = [
  'registration_status',
  'registration_date',
  'ticket_tier',
  'payment_amount',
  'nft_minted'
];

type AccessType = 'public' | 'nft-gated' | 'time-based';

export interface TicketTierMetadata {
  id?: string;
  name: string;
  description?: string;
  price: number;
  currency: 'ALGO' | 'USD';
  quantity?: number;
  benefits?: string[];
  transferable?: boolean;
}

export interface OrganizerMetadata {
  name?: string;
  email?: string;
  phone?: string;
  organization?: string;
}

export interface EventMetadata {
  description?: string;
  resolverUrl: string;
  tags?: string[];
  visibility?: 'public' | 'private' | 'unlisted';
  requiresApproval?: boolean;
  ticketTiers?: TicketTierMetadata[];
  organizer?: OrganizerMetadata;
  lastUpdatedAt?: string;
  lastScannedAt?: string;
}

export interface RegistrationMetadata {
  attendeeName?: string;
  attendeeEmail?: string;
  attendeePhone?: string;
  ticketTierLabel?: string;
  paymentAmountMicroAlgos?: number;
  transactionId?: string;
  attendanceConfirmedAt?: string;
}

export interface DynamicQREvent {
  eventId: string;
  eventName: string;
  currentUrl: string;
  description?: string;
  accessType: AccessType;
  expiryDate?: string;
  createdAt: string;
  owner: string;
  scanCount: number;
  active: boolean;
  resolverUrl: string;
  ticketPriceMicroAlgos: number;
  ticketPriceAlgos: number;
  maxCapacity: number;
  registeredCount: number;
  nftAssetId?: number;
  metadata?: EventMetadata;
  transactionId?: string;
  blockHeight?: number;
}

export interface CreateEventPayload {
  eventId: string;
  eventName: string;
  currentUrl: string;
  description?: string;
  accessType: AccessType;
  expiryDate?: string;
  resolverUrl?: string;
  ticketPriceMicroAlgos?: number;
  ticketPriceAlgos?: number;
  maxCapacity?: number;
  visibility?: 'public' | 'private' | 'unlisted';
  requiresApproval?: boolean;
  tags?: string[];
  organizer?: OrganizerMetadata;
  ticketTiers?: TicketTierMetadata[];
}

export interface RegisterEventPayload {
  eventId: string;
  attendeeAddress?: string;
  ticketTier?: string;
  ticketTierIndex?: number;
  paymentAmount?: number;
  paymentAmountMicroAlgos?: number;
  attendeeName?: string;
  attendeeEmail?: string;
  attendeePhone?: string;
}

export interface EventRegistration {
  eventId: string;
  attendeeAddress: string;
  status: 'pending' | 'confirmed' | 'attended' | 'cancelled';
  registrationDate?: string;
  ticketTierIndex?: number;
  ticketTierName?: string;
  paymentAmountMicroAlgos?: number;
  paymentAmountAlgos?: number;
  nftMinted?: boolean;
  metadata?: RegistrationMetadata;
}

export interface ContractResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  data?: any;
}

class DynaQRAlgorandService {
  private appId: number;
  private metadataCache: Record<string, EventMetadata> | null = null;
  private registrationCache: Record<string, Record<string, RegistrationMetadata>> | null =
    null;
  private readonly metadataStorageKey = 'dynaqr:event-metadata';
  private readonly registrationStorageKey = 'dynaqr:registration-metadata';

  constructor() {
    this.appId = DEFAULT_APP_ID;
  }

  async connectWallet(
    provider: 'pera' | 'myalgo' | 'auto' = 'auto'
  ): Promise<WalletAccount | null> {
    const result = await walletService.connectWallet(provider);
    if (result.success && result.account) {
      return result.account;
    }
    throw new Error(result.error || 'Wallet connection failed');
  }

  async disconnectWallet(): Promise<void> {
    await walletService.disconnectWallet();
  }

  getConnectedAccount(): WalletAccount | null {
    return walletService.getConnectedAccount();
  }

  isWalletConnected(): boolean {
    return walletService.isConnected();
  }

  setContractAppId(appId: number): void {
    this.appId = appId;
  }

  getContractAppId(): number {
    return this.appId;
  }

  async deployContract(): Promise<ContractResult> {
    return {
      success: false,
      error:
        'Smart contract deployment must be performed via the deployment pipeline or CLI tooling.'
    };
  }

  async createEvent(payload: CreateEventPayload): Promise<ContractResult> {
    try {
      const account = this.ensureWalletConnected();
      const appId = this.ensureAppId();

      if (!payload.eventId) {
        throw new Error('Event ID is required');
      }

      const resolverUrl = payload.resolverUrl || this.buildResolverUrl(payload.eventId);
      const expirySeconds = payload.expiryDate
        ? Math.floor(new Date(payload.expiryDate).getTime() / 1000)
        : 0;

      const ticketPriceMicro =
        payload.ticketPriceMicroAlgos ||
        Math.max(0, Math.round((payload.ticketPriceAlgos || 0) * 1_000_000));
      const maxCapacity = payload.maxCapacity ?? 0;

      const appArgs = [
        this.encodeArg(DYNAQR_CONTRACT.methods.CREATE_EVENT),
        this.encodeArg(payload.eventId),
        this.encodeArg(payload.eventName),
        this.encodeArg(payload.currentUrl),
        this.encodeArg(payload.accessType),
        this.encodeArg(expirySeconds.toString()),
        this.encodeArg(ticketPriceMicro.toString()),
        this.encodeArg(maxCapacity.toString())
      ];

      const metadata: EventMetadata = {
        description: payload.description,
        resolverUrl,
        tags: payload.tags,
        visibility: payload.visibility,
        requiresApproval: payload.requiresApproval,
        ticketTiers: payload.ticketTiers,
        organizer: payload.organizer,
        lastUpdatedAt: new Date().toISOString()
      };

      const txn = await this.buildApplicationCall(appArgs, {
        note: this.encodeNotePayload({
          type: 'event_metadata',
          eventId: payload.eventId,
          metadata
        }),
        sender: account.address,
        appId
      });

      const txResult = await walletService.signAndSendTransaction(txn);

      if (!txResult.success) {
        return { success: false, error: txResult.error };
      }

      this.persistEventMetadata(payload.eventId, metadata);

      const event = await this.getEvent(payload.eventId);

      return {
        success: true,
        transactionId: txResult.transactionId,
        data: event.success ? event.data : undefined
      };
    } catch (error) {
      console.error('❌ Event creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async registerForEvent(payload: RegisterEventPayload): Promise<ContractResult> {
    try {
      const account = this.ensureWalletConnected();
      const appId = this.ensureAppId();

      await walletService.ensureAppOptIn(appId, account.address);

      if (payload.attendeeAddress && payload.attendeeAddress !== account.address) {
        throw new Error('Connected wallet does not match attendee address');
      }

      const eventResult = await this.getEvent(payload.eventId);
      if (!eventResult.success || !eventResult.data) {
        return { success: false, error: 'Event not found' };
      }

      const event = eventResult.data as DynamicQREvent;

      if (!event.active) {
        return { success: false, error: 'Event is not active' };
      }

      const ticketTierIndex =
        payload.ticketTierIndex ??
        this.resolveTicketTierIndex(event.metadata?.ticketTiers, payload.ticketTier);

      const ticketTierName =
        payload.ticketTier ??
        event.metadata?.ticketTiers?.[ticketTierIndex ?? 0]?.name ??
        'General Admission';

      const paymentAmountMicro =
        payload.paymentAmountMicroAlgos ?? payload.paymentAmount ?? 0;

      if (paymentAmountMicro > 0) {
        const paymentResult = await walletService.sendPayment(
          event.owner,
          paymentAmountMicro,
          `event:${payload.eventId}`
        );

        if (!paymentResult.success) {
          return {
            success: false,
            error: paymentResult.error || 'Payment transaction failed'
          };
        }
      }

      const appArgs = [
        this.encodeArg(DYNAQR_CONTRACT.methods.REGISTER_EVENT),
        this.encodeArg(payload.eventId),
        this.encodeArg((ticketTierIndex ?? 0).toString()),
        this.encodeArg(Math.max(paymentAmountMicro, 0).toString())
      ];

      const metadata: RegistrationMetadata = {
        attendeeName: payload.attendeeName,
        attendeeEmail: payload.attendeeEmail,
        attendeePhone: payload.attendeePhone,
        ticketTierLabel: ticketTierName,
        paymentAmountMicroAlgos: paymentAmountMicro
      };

      const txn = await this.buildApplicationCall(appArgs, {
        note: this.encodeNotePayload({
          type: 'event_registration',
          eventId: payload.eventId,
          attendee: account.address,
          metadata
        }),
        sender: account.address,
        appId
      });

      const txResult = await walletService.signAndSendTransaction(txn);

      if (!txResult.success) {
        return { success: false, error: txResult.error };
      }

      metadata.transactionId = txResult.transactionId || undefined;
      this.persistRegistrationMetadata(account.address, payload.eventId, metadata);

      return {
        success: true,
        transactionId: txResult.transactionId
      };
    } catch (error) {
      console.error('❌ Event registration failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async confirmAttendance(eventId: string): Promise<ContractResult> {
    try {
      const account = this.ensureWalletConnected();
      const appId = this.ensureAppId();

      const appArgs = [
        this.encodeArg(DYNAQR_CONTRACT.methods.CONFIRM_ATTENDANCE),
        this.encodeArg(eventId),
        this.encodeArg(Date.now().toString())
      ];

      const txn = await this.buildApplicationCall(appArgs, {
        sender: account.address,
        appId
      });

      const txResult = await walletService.signAndSendTransaction(txn);

      if (!txResult.success) {
        return { success: false, error: txResult.error };
      }

      this.updateRegistrationMetadata(account.address, eventId, {
        attendanceConfirmedAt: new Date().toISOString()
      });

      this.updateEventMetadata(eventId, {
        lastScannedAt: new Date().toISOString()
      });

      return {
        success: true,
        transactionId: txResult.transactionId
      };
    } catch (error) {
      console.error('❌ Attendance confirmation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async updateEventUrl(eventId: string, newUrl: string): Promise<ContractResult> {
    try {
      const account = this.ensureWalletConnected();
      const appId = this.ensureAppId();

      const appArgs = [
        this.encodeArg(DYNAQR_CONTRACT.methods.UPDATE_URL),
        this.encodeArg(eventId),
        this.encodeArg(newUrl)
      ];

      const txn = await this.buildApplicationCall(appArgs, {
        sender: account.address,
        appId
      });

      const txResult = await walletService.signAndSendTransaction(txn);

      if (!txResult.success) {
        return { success: false, error: txResult.error };
      }

      this.updateEventMetadata(eventId, {
        lastUpdatedAt: new Date().toISOString()
      });

      return {
        success: true,
        transactionId: txResult.transactionId,
        data: { eventId, newUrl }
      };
    } catch (error) {
      console.error('❌ Event URL update failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getEvent(eventId: string): Promise<ContractResult> {
    try {
      const stateMap = await this.getApplicationStateByEvent();
      const eventState = stateMap.get(eventId);

      if (!eventState) {
        return { success: false, error: 'Event not found' };
      }

      const event = this.composeEvent(
        eventId,
        eventState,
        this.getEventMetadata(eventId)
      );

      return {
        success: true,
        data: event
      };
    } catch (error) {
      console.error('❌ Get event failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async incrementScanCount(eventId: string): Promise<ContractResult> {
    try {
      const account = this.ensureWalletConnected();
      const appId = this.ensureAppId();

      const appArgs = [
        this.encodeArg(DYNAQR_CONTRACT.methods.INCREMENT_SCAN),
        this.encodeArg(eventId)
      ];

      const txn = await this.buildApplicationCall(appArgs, {
        sender: account.address,
        appId
      });

      const txResult = await walletService.signAndSendTransaction(txn);

      if (!txResult.success) {
        return { success: false, error: txResult.error };
      }

      this.updateEventMetadata(eventId, {
        lastScannedAt: new Date().toISOString()
      });

      return {
        success: true,
        transactionId: txResult.transactionId
      };
    } catch (error) {
      console.error('❌ Scan count increment failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async deactivateEvent(eventId: string): Promise<ContractResult> {
    try {
      const account = this.ensureWalletConnected();
      const appId = this.ensureAppId();

      const appArgs = [
        this.encodeArg(DYNAQR_CONTRACT.methods.DEACTIVATE_EVENT),
        this.encodeArg(eventId)
      ];

      const txn = await this.buildApplicationCall(appArgs, {
        sender: account.address,
        appId
      });

      const txResult = await walletService.signAndSendTransaction(txn);

      if (!txResult.success) {
        return { success: false, error: txResult.error };
      }

      this.updateEventMetadata(eventId, {
        lastUpdatedAt: new Date().toISOString()
      });

      return {
        success: true,
        transactionId: txResult.transactionId,
        data: { eventId, active: false }
      };
    } catch (error) {
      console.error('❌ Event deactivation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getAccountBalance(address?: string): Promise<number> {
    try {
      return await walletService.getAccountBalance(address);
    } catch (error) {
      console.error('❌ Balance check failed:', error);
      return 0;
    }
  }

  async getNetworkStatus(): Promise<{
    status: string;
    blockHeight: number;
    responseTime: number;
  }> {
    try {
      return await walletService.getNetworkStatus();
    } catch (error) {
      console.error('❌ Network status check failed:', error);
      return {
        status: 'offline',
        blockHeight: 0,
        responseTime: 0
      };
    }
  }

  async getAllUserEvents(): Promise<DynamicQREvent[]> {
    try {
      if (!this.isWalletConnected()) {
        return [];
      }

      const account = this.ensureWalletConnected();
      const stateMap = await this.getApplicationStateByEvent();
      const metadataStore = this.loadEventMetadataStore();
      const events: DynamicQREvent[] = [];

      stateMap.forEach((value, key) => {
        const event = this.composeEvent(key, value, metadataStore[key]);
        if (event.owner === account.address) {
          events.push(event);
        }
      });

      return events.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('❌ Get user events failed:', error);
      return [];
    }
  }

  async getUserRegistrations(userAddress?: string): Promise<ContractResult> {
    try {
      const address = userAddress || this.getConnectedAccount()?.address;
      if (!address) {
        return { success: false, error: 'No address provided' };
      }

      const appId = this.ensureAppId();
      const accountInfo = await algodClient.accountApplicationInformation(address, appId).do();
      const keyValues = accountInfo['app-local-state']?.['key-value'] ?? [];

      const registrations: Record<string, Partial<EventRegistration>> = {};
      keyValues.forEach((entry: any) => {
        const key = this.decodeStateKey(entry.key);
        const suffix = REGISTRATION_SUFFIXES.find((s) => key.endsWith(s));
        if (!suffix) return;

        const eventId = key.slice(0, key.length - suffix.length);
        if (!eventId) return;

        const registration = registrations[eventId] || {
          eventId,
          attendeeAddress: address,
          status: 'pending' as EventRegistration['status']
        };

        switch (suffix) {
          case 'registration_status':
            registration.status = this.mapRegistrationStatus(entry.value.uint ?? 0);
            break;
          case 'registration_date':
            registration.registrationDate = this.toISOString(entry.value.uint);
            break;
          case 'ticket_tier':
            registration.ticketTierIndex = Number(entry.value.uint ?? 0);
            break;
          case 'payment_amount':
            registration.paymentAmountMicroAlgos = Number(entry.value.uint ?? 0);
            registration.paymentAmountAlgos =
              Math.round(((entry.value.uint ?? 0) / 1_000_000) * 1e6) / 1e6;
            break;
          case 'nft_minted':
            registration.nftMinted = Boolean(entry.value.uint);
            break;
          default:
            break;
        }

        registrations[eventId] = registration;
      });

      const metadataStore = this.loadRegistrationMetadataStore();
      const eventMetadataStore = this.loadEventMetadataStore();
      const results: EventRegistration[] = [];

      for (const [eventId, registration] of Object.entries(registrations)) {
        const tierIndex = registration.ticketTierIndex ?? 0;
        const metadata = metadataStore[address]?.[eventId];
        const tierName =
          eventMetadataStore[eventId]?.ticketTiers?.[tierIndex]?.name ||
          metadata?.ticketTierLabel ||
          `Tier ${tierIndex + 1}`;

        results.push({
          eventId,
          attendeeAddress: registration.attendeeAddress!,
          status: registration.status!,
          registrationDate: registration.registrationDate,
          ticketTierIndex: registration.ticketTierIndex,
          ticketTierName: tierName,
          paymentAmountMicroAlgos: registration.paymentAmountMicroAlgos,
          paymentAmountAlgos: registration.paymentAmountAlgos,
          nftMinted: registration.nftMinted,
          metadata
        });
      }

      return {
        success: true,
        data: results
      };
    } catch (error) {
      console.error('❌ Failed to get user registrations:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getEventAnalytics(
    eventId: string
  ): Promise<{
    totalScans: number;
    totalRegistrations: number;
    dailyScans: number[];
    lastScanned?: string;
    averageScansPerDay: number;
  } | null> {
    try {
      const eventResult = await this.getEvent(eventId);
      if (!eventResult.success || !eventResult.data) {
        return null;
      }

      const event = eventResult.data as DynamicQREvent;
      const totalScans = event.scanCount;
      const totalRegistrations = event.registeredCount;

      const days = 7;
      const base = Math.floor(totalScans / days);
      const remainder = totalScans % days;
      const dailyScans = Array.from({ length: days }, (_, index) =>
        base + (index < remainder ? 1 : 0)
      );

      const averageScansPerDay = days > 0 ? totalScans / days : 0;

      return {
        totalScans,
        totalRegistrations,
        dailyScans,
        lastScanned: event.metadata?.lastScannedAt,
        averageScansPerDay
      };
    } catch (error) {
      console.error('❌ Get event analytics failed:', error);
      return null;
    }
  }

  private ensureWalletConnected(): WalletAccount {
    const account = this.getConnectedAccount();
    if (!account) {
      throw new Error('Wallet not connected');
    }
    return account;
  }

  private ensureAppId(): number {
    if (!this.appId || this.appId <= 0) {
      throw new Error('DynaQR smart contract App ID is not configured');
    }
    return this.appId;
  }

  private encodeArg(value: string): Uint8Array {
    return textEncoder.encode(value);
  }

  private encodeNotePayload(payload: Record<string, any>): Uint8Array | undefined {
    try {
      return textEncoder.encode(JSON.stringify(payload));
    } catch (error) {
      console.warn('Failed to encode note payload:', error);
      return undefined;
    }
  }

  private async buildApplicationCall(
    appArgs: Uint8Array[],
    options: { note?: Uint8Array; sender: string; appId: number }
  ): Promise<algosdk.Transaction> {
    const suggestedParams = await algodClient.getTransactionParams().do();

    return algosdk.makeApplicationNoOpTxnFromObject({
      from: options.sender,
      appIndex: options.appId,
      appArgs,
      suggestedParams,
      note: options.note
    });
  }

  private async getApplicationStateByEvent(): Promise<
    Map<string, Map<string, { type: number; bytes?: string; uint?: number }>>
  > {
    const appId = this.ensureAppId();
    const appInfo = await algodClient.getApplicationByID(appId).do();
    const globalState = appInfo.params?.['global-state'] ?? [];

    const events = new Map<string, Map<string, { type: number; bytes?: string; uint?: number }>>();

    globalState.forEach((entry: any) => {
      const key = this.decodeStateKey(entry.key);
      const suffix = EVENT_GLOBAL_SUFFIXES.find((s) => key.endsWith(s));
      if (!suffix) return;

      const rawEventId = key.slice(0, key.length - suffix.length);
      const eventId = rawEventId.endsWith('::') ? rawEventId.slice(0, -2) : rawEventId;
      if (!eventId) return;

      const eventState = events.get(eventId) || new Map();
      eventState.set(suffix, entry.value);
      events.set(eventId, eventState);
    });

    return events;
  }

  private composeEvent(
    eventId: string,
    state: Map<string, { type: number; bytes?: string; uint?: number }>,
    metadata?: EventMetadata
  ): DynamicQREvent {
    const eventName = this.decodeBytesValue(state.get('event_name')) || eventId;
    const currentUrl = this.decodeBytesValue(state.get('current_url')) || metadata?.resolverUrl || '';
    const accessType = (this.decodeBytesValue(state.get('access_type')) as AccessType) || 'public';
    const owner = this.decodeAddress(state.get('owner')) || '';
    const scanCount = this.decodeUintValue(state.get('scan_count'));
    const active = this.decodeUintValue(state.get('active')) === 1;
    const ticketPriceMicro = this.decodeUintValue(state.get('ticket_price'));
    const maxCapacity = this.decodeUintValue(state.get('max_capacity'));
    const registeredCount = this.decodeUintValue(state.get('registered_count'));
    const nftAssetIdValue = this.decodeUintValue(state.get('nft_asset_id'));
    const createdAt =
      this.toISOString(this.decodeUintValue(state.get('created_at'))) ||
      new Date(0).toISOString();
    const expiryDateValue = this.decodeUintValue(state.get('expiry_date'));

    return {
      eventId,
      eventName,
      currentUrl,
      description: metadata?.description,
      accessType,
      expiryDate: expiryDateValue ? this.toISOString(expiryDateValue) : undefined,
      createdAt,
      owner,
      scanCount,
      active,
      resolverUrl: metadata?.resolverUrl || this.buildResolverUrl(eventId),
      ticketPriceMicroAlgos: ticketPriceMicro,
      ticketPriceAlgos: Math.round((ticketPriceMicro / 1_000_000) * 1e6) / 1e6,
      maxCapacity,
      registeredCount,
      nftAssetId: nftAssetIdValue > 0 ? nftAssetIdValue : undefined,
      metadata
    };
  }

  private decodeStateKey(key: string): string {
    return textDecoder.decode(this.base64ToUint8Array(key));
  }

  private decodeBytesValue(entry?: { type: number; bytes?: string }): string | undefined {
    if (!entry || entry.type !== 1 || !entry.bytes) return undefined;
    return textDecoder.decode(this.base64ToUint8Array(entry.bytes));
  }

  private decodeAddress(entry?: { type: number; bytes?: string }): string | undefined {
    if (!entry || entry.type !== 1 || !entry.bytes) return undefined;
    try {
      return algosdk.encodeAddress(this.base64ToUint8Array(entry.bytes));
    } catch (error) {
      console.warn('Failed to decode address from state:', error);
      return undefined;
    }
  }

  private decodeUintValue(entry?: { type: number; uint?: number }): number {
    if (!entry || entry.type !== 2) return 0;
    return Number(entry.uint ?? 0);
  }

  private base64ToUint8Array(value: string): Uint8Array {
    if (typeof globalThis.atob === 'function') {
      return Uint8Array.from(globalThis.atob(value), (c) => c.charCodeAt(0));
    }

    const buffer = typeof Buffer !== 'undefined' ? Buffer.from(value, 'base64') : [];
    return buffer instanceof Uint8Array ? buffer : Uint8Array.from(buffer);
  }

  private toISOString(seconds?: number): string | undefined {
    if (!seconds || seconds <= 0) {
      return undefined;
    }
    return new Date(seconds * 1000).toISOString();
  }

  private resolveTicketTierIndex(
    tiers: TicketTierMetadata[] | undefined,
    ticketTier?: string
  ): number {
    if (!tiers || !tiers.length) {
      return 0;
    }

    if (!ticketTier) {
      return 0;
    }

    const index = tiers.findIndex(
      (tier) => tier.id === ticketTier || tier.name.toLowerCase() === ticketTier.toLowerCase()
    );

    return index >= 0 ? index : 0;
  }

  private mapRegistrationStatus(code: number): EventRegistration['status'] {
    switch (code) {
      case 1:
        return 'confirmed';
      case 2:
        return 'attended';
      case 3:
        return 'cancelled';
      default:
        return 'pending';
    }
  }

  private buildResolverUrl(eventId: string): string {
    return `${RESOLVER_BASE_URL.replace(/\/$/, '')}/resolve?event=${encodeURIComponent(eventId)}`;
  }

  private loadEventMetadataStore(): Record<string, EventMetadata> {
    if (this.metadataCache) {
      return this.metadataCache;
    }

    if (typeof window === 'undefined') {
      this.metadataCache = {};
      return this.metadataCache;
    }

    try {
      const raw = window.localStorage.getItem(this.metadataStorageKey);
      this.metadataCache = raw ? JSON.parse(raw) : {};
    } catch (error) {
      console.warn('Failed to load event metadata store:', error);
      this.metadataCache = {};
    }

    return this.metadataCache;
  }

  private persistEventMetadata(eventId: string, metadata: EventMetadata): void {
    const store = this.loadEventMetadataStore();
    store[eventId] = {
      ...store[eventId],
      ...metadata,
      resolverUrl: metadata.resolverUrl
    };

    this.metadataCache = store;

    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(this.metadataStorageKey, JSON.stringify(store));
      } catch (error) {
        console.warn('Failed to persist event metadata:', error);
      }
    }
  }

  private updateEventMetadata(eventId: string, metadata: Partial<EventMetadata>): void {
    const existing =
      this.getEventMetadata(eventId) || { resolverUrl: this.buildResolverUrl(eventId) };
    this.persistEventMetadata(eventId, { ...existing, ...metadata });
  }

  private getEventMetadata(eventId: string): EventMetadata | undefined {
    const store = this.loadEventMetadataStore();
    return store[eventId];
  }

  private loadRegistrationMetadataStore(): Record<string, Record<string, RegistrationMetadata>> {
    if (this.registrationCache) {
      return this.registrationCache;
    }

    if (typeof window === 'undefined') {
      this.registrationCache = {};
      return this.registrationCache;
    }

    try {
      const raw = window.localStorage.getItem(this.registrationStorageKey);
      this.registrationCache = raw ? JSON.parse(raw) : {};
    } catch (error) {
      console.warn('Failed to load registration metadata store:', error);
      this.registrationCache = {};
    }

    return this.registrationCache;
  }

  private persistRegistrationMetadata(
    attendeeAddress: string,
    eventId: string,
    metadata: RegistrationMetadata
  ): void {
    const store = this.loadRegistrationMetadataStore();
    store[attendeeAddress] = store[attendeeAddress] || {};
    store[attendeeAddress][eventId] = {
      ...store[attendeeAddress][eventId],
      ...metadata
    };

    this.registrationCache = store;

    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(this.registrationStorageKey, JSON.stringify(store));
      } catch (error) {
        console.warn('Failed to persist registration metadata:', error);
      }
    }
  }

  private updateRegistrationMetadata(
    attendeeAddress: string,
    eventId: string,
    metadata: Partial<RegistrationMetadata>
  ): void {
    const existing =
      this.loadRegistrationMetadataStore()[attendeeAddress]?.[eventId] || {};
    this.persistRegistrationMetadata(attendeeAddress, eventId, { ...existing, ...metadata });
  }
}

export const dynaQRService = new DynaQRAlgorandService();

export const connectWallet = () => dynaQRService.connectWallet();
export const disconnectWallet = () => dynaQRService.disconnectWallet();
export const getConnectedAccount = () => dynaQRService.getConnectedAccount();

export const generateQRCode = async (data: string): Promise<string> => {
  return `data:image/svg+xml;base64,${btoa(`<svg>QR Code for: ${data}</svg>`)}`;
};

export default dynaQRService;
