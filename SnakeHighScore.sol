// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SnakeHighScore {
    address public owner;

    struct Player {
        uint score;
    }

    mapping(address => Player) public players;
    address[] public leaderboard;

    constructor() {
        owner = msg.sender;
    }

    function submitScore(uint _score) public {
        require(_score > players[msg.sender].score, "Only higher scores allowed");
        players[msg.sender].score = _score;
        leaderboard.push(msg.sender);
    }

    function getScore(address _player) public view returns (uint) {
        return players[_player].score;
    }

    function getLeaderboard() public view returns (address[] memory) {
        return leaderboard;
    }
}
