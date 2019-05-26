// src/App.js

import { Client } from 'boardgame.io/react';
import { Game } from 'boardgame.io/core';
import React from 'react';

class tile {
  constructor(suit, val){
    this.suit = suit
    this.val = val
  }

  toString(){
    return "" + this.val + "" + this.suit
  }
}

class player {
  constructor(startingHand){
    this.pool = [];
    this.hand = startingHand;
  }
}

const suits = ["m","p","b"]
const values = ["1","2","3","4","5","6","7","8","9",
                "1","2","3","4","5","6","7","8","9",
                "1","2","3","4","5","6","7","8","9",
                "1","2","3","4","5","6","7","8","9"]
const honors = ["R","W","G","E","S","W","N",
                "R","W","G","E","S","W","N",
                "R","W","G","E","S","W","N",
                "R","W","G","E","S","W","N"]

/**
 * Randomize array element order in-place.
 * Using Durstenfeld shuffle algorithm.
 */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array
}

class mahjongHand extends React.Component {
  onClick(id) {
    if (this.isActive(id)) {
      this.props.moves.discardTile(id);
      this.props.events.endTurn();
    }
  }

  isActive(id) {
    if (!this.props.isActive) return false;
    return true;
  }

  render() {
    let winner = '';
    if (this.props.ctx.gameover) {
      winner =
        this.props.ctx.gameover.winner !== undefined ? (
          <div id="winner">Winner: {this.props.ctx.gameover.winner}</div>
        ) : (
          <div id="winner">Draw!</div>
        );
    }

    const cellStyle = {
      border: '1px solid #555',
      width: '50px',
      height: '50px',
      lineHeight: '50px',
      textAlign: 'center',
    };

    let tbody = [];
    let cells = [];
    let header = ""
    for (let j = 0; j < this.props.G.wall.length; j++) {
      const id = j;
      cells.push(
        <td style={cellStyle} key={id}>
          {this.props.G.wall[j].toString()}
        </td>
      );
    }
    tbody.push(<tr key="wall"><td>Wall</td>{cells}</tr>);

    cells = [];
    for (let j = 0; j < this.props.G.deadWall.length; j++) {
      const id = j;
      cells.push(
        <td style={cellStyle} key={id}>
          {this.props.G.deadWall[j].toString()}
        </td>
      );
    }
    tbody.push(<tr key="deadWall"><td>Dead Wall</td>{cells}</tr>);

    for (let i = 0; i < this.props.G.players.length; i++) {
      cells = [];
      for (let j = 0; j < this.props.G.players[i].hand.length; j++) {
        const id = j;
        cells.push(
          <td style={cellStyle} key={id} onClick={() => this.onClick(id)}>
            {this.props.G.players[i].hand[j].toString()}
          </td>
        );
      }
      header = "Player " + (i + 1)
      tbody.push(<tr key="player{i}">{header}{cells}</tr>);
    }

    for (let i = 0; i < this.props.G.players.length; i++) {
      cells = [];
      for (let j = 0; j < this.props.G.players[i].pool.length; j++) {
        const id = j;
        cells.push(
          <td style={cellStyle} key={id} onClick={() => this.onClick(id)}>
            {this.props.G.players[i].pool[j].toString()}
          </td>
        );
      }
      header = "Player " + (i + 1) + "'s Pool"
      tbody.push(<tr key="player{i}">{header}{cells}</tr>);
    }

    return (
      <div>
        <table id="board">
          <tbody>{tbody}</tbody>
        </table>
        {winner}
      </div>
    );
  }
}

const mahjong = Game({
  setup: () => {
    let wall = shuffleArray(Array.concat.apply([],suits.map(suit =>
                        values.map(value => (new tile(suit,value)))))
                        .concat(honors.map(honor => new tile(honor,""))));
    let deadWall = wall.splice(wall.length-14)
    let players = Array(4).fill(null).map(p => (new player(wall.splice(0,13))))
    let wallcount = wall.length;

    return {
      wall,
      deadWall,
      wallcount,
      players
    }
  },

  moves: {
    discardTile(G, ctx, id) {
      G.players[ctx.currentPlayer].pool.push(G.players[ctx.currentPlayer].hand.splice(id,1))
    },
  },

  flow: {
    onTurnBegin: (G, ctx) => {
      if(G.players[ctx.currentPlayer].hand.length < 14){
        G.players[ctx.currentPlayer].hand.push(G.wall.shift())
      }
    }
  },
});

const App = Client({
  game: mahjong,
  numPlayers: 4,
  board: mahjongHand,
});

export default App;