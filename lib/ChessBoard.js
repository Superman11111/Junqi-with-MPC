const { pick } = require('underscore');
var ChessPiece = require('./ChessPiece');
var Graph = require('./Graph');

const BOMB = "10";
const COMMANDER = "11";
const ENGINEER = "19";
const MINE = "20";
const FLAG = "21";


const CN_LEFT_RAIL = [31, 36, 41, 46, 51];
const CN_RIGHT_RAIL = [35, 40, 45, 50, 55];
const CN_BACK_RAIL = [51, 52, 53, 54, 55];
const CN_FRONT_RAIL = [31, 32, 33, 34, 35];

const US_LEFT_RAIL = [5, 10, 15, 20, 25];
const US_RIGHT_RAIL = [26, 6, 11, 16, 21];
const US_FRONT_RAIL = [30, 26, 27, 28, 29];
const US_BACK_RAIL = [6, 7, 8, 9, 10];

const LEFT_RAIL = CN_LEFT_RAIL.concat(US_RIGHT_RAIL);
const RIGHT_RAIL = CN_RIGHT_RAIL.concat(US_LEFT_RAIL);

const RAIL_WAYS = [
    LEFT_RAIL,
    RIGHT_RAIL,
    CN_BACK_RAIL,
    CN_FRONT_RAIL,
    US_FRONT_RAIL,
    US_BACK_RAIL
];

var camps = [12, 14, 18, 22, 24, 37, 39, 43, 47, 49];

const headquarters = [[56, 58], [2, 4]];

var graph, nodes;

function chessBoard()
{
  this.PiecePositions = {
      1: new Piece('CN', '20'), 2: new Piece('CN', '21'), 3: new Piece('CN', '20'), 4: new Piece('CN', '10'), 5: new Piece('CN', '10'),
      6: new Piece('CN', '19'),  7: new Piece('CN', '20'), 8: new Piece('CN', '19'), 9: new Piece('CN', '12'), 10: new Piece('CN', '19'),
      11: new Piece('CN', '16'),  12: null,                 13: new Piece('CN', '16'), 14: null,                15: new Piece('CN', '15'),
      16:  new Piece('CN', '11'),  17: new Piece('CN', '13'),   18: null,                 19: new Piece('CN', '13'),  20: new Piece('CN', '15'),
      21:  new Piece('CN', '18'),  22: null,                  23: new Piece('CN', '18'),  24: null,                 25: new Piece('CN', '18'),
      26:  new Piece('CN', '17'),  27: new Piece('CN', '17'),   28: new Piece('CN', '17'),  29: new Piece('CN', '14'), 30: new Piece('CN', '14'),
      31:  new Piece('US', '17'),  32: new Piece('US', '12'),   33: new Piece('US', '17'),  34: new Piece('US', '13'),  35: new Piece('US', '17'),
      36:  new Piece('US', '14'),  37: null,                  38: new Piece('US', '15'),  39: null,                 40: new Piece('US', '14'),
      41:  new Piece('US', '18'),  42: new Piece('US', '13'),   43: null,                 44: new Piece('US', '11'),  45: new Piece('US', '18'),
      46:  new Piece('US', '16'),  47: null,                  48: new Piece('US', '18'),  49: null,                 50: new Piece('US', '15'),
      51:  new Piece('US', '19'),  52: new Piece('US', '20'),  53: new Piece('US', '20'), 54: new Piece('US', '19'), 55: new Piece('US', '19'),
      56:  new Piece('US', '10'),  57: new Piece('US', '21'),  58: new Piece('US', '20'), 59: new Piece('US', '10'), 60: new Piece('US', '16')
  };

  nodes = Object.keys(this.PiecePositions);
  graph = new Graph(RAIL_WAYS);
}

var getMoves = function(currentPosition, PiecePositions) {
    var piece = PiecePositions[currentPosition];
    var isEngineer = piece.getRank() == ENGINEER;
    reachablePositions = graph.getReachablePosition(currentPosition, isEngineer, PiecePositions);
    var movesArray = Array.from(reachablePositions).filter((reachablePosition) => currentPosition != reachablePosition)
    .map(function(reachablePosition) {
        var destPiece = PiecePositions[reachablePosition];
        if(destPiece != null) {
            if(piece.getCountry() === destPiece.getCountry() || camps.includes(reachablePosition) === true)
                return null;
            return {
                move_type: "attack",
                startpoint: currentPosition,
                endpoint: reachablePosition
            };
        }
        return {
            move_type: "move",
            startpoint: currentPosition,
            endpoint: reachablePosition
        };
    }).filter((a) => a);
}

var isValidBombPosition = function(row) {
    // don't allow front row placement
    var isPlayer1FrontRow = (row === 6);
    var isPlayer2FrontRow = (row === 7);
    return !isPlayer1FrontRow && !isPlayer2FrontRow;
  }
  
  var isValidMinePosition = function(row) {
    // landmines only in back two rows
    var isPlayer1BackTwoRows = (row === 1 || row === 2);
    var isPlayer2BackTwoRows = (row === 11 || row === 12);
    return isPlayer1BackTwoRows || isPlayer2BackTwoRows;
  }
  
  var isValidFlagPosition = function(current, destination) {
    // flag can only go in headquarters
    var isPlayer1Headquarters = headquarters[0].includes(current) && headquarters[0].includes(destination) && current != destination;
    var isPlayer2Headquarters = headquarters[1].includes(current) && headquarters[1].includes(destination) && current != destination;
    return isPlayer1Headquarters || isPlayer2Headquarters;
  }
  

var isPositionValid = function(pieceRank, currentPosition, destination) {
    var row = (parseInt(destination) - 1) / 5 + 1;
    // Check if piece has restrictions
    if (pieceRank == BOMB) {
        return isValidBombPosition(row);
    }
    else if (pieceRank == MINE) {
        return isValidMinePosition(row);
    }
    else if (pieceRank == FLAG) {
        return isValidFlagPosition(currentPosition, destination);
    }
      return true;
  }
  

var getSwaps = function(currentPosition, PiecePositions) {
    var country = PiecePositions[currentPosition].getCountry();
    sameCountry = Object.keys(PiecePositions)
    .filter((position) => PiecePositions[position])
    .filter((position) => PiecePositions[position].getCountry() === country);

    return sameCountry.filter((position) => currentPosition !== position) 
    .filter((position) => isPositionValid(PiecePositions[currentPosition].getRank(), currentPosition, position))
    .map((position) => ({
      move_type          : 'swap',
      startpoint   : currentPosition,
      endpoint   : position
    }));
}

chessBoard.prototype.getAllMoves = function(country) {
    var sameCountry = Object.keys(this.PiecePositions)
    .filter((position) => this.PiecePositions[position])
    .filter((position) => this.PiecePositions[position].getCountry() === country);
    return sameCountry.filter((position) => !this.PiecePositions[position].isFixed())
    .map((position) => getMoves(position, this.PiecePositions))
    .flat();
}

chessBoard.prototype.getAllSwaps = function() {
    return Object.keys(this.PiecePositions).filter((position) => this.PiecePositions[position])
    .map((position) => getSwaps(position, this.PiecePositions)).flat();
}


chessBoard.prototype.swapPieces = function(startpoint, endpoint) {
    var startpiece = this.PiecePositions[startpoint];
    var endpiece = this.PiecePositions[endpoint];
  
    this.PiecePositions[startpoint] = endpiece;
    this.PiecePositions[endpoint] = startpiece;
  }
  
  
  /**
   * Determine if a player's flag is captured or not
   */
  Board.prototype.isPlayerFlagCaptured = function(playerColor) {
      return !doesPieceExist(this.boardState, playerColor, RANK_FLAG);
  };
  
  /**
   * Determine if a player still has the commander (rank 1). If not, then reveal the flag
   */
  Board.prototype.isCommanderAlive = function(playerColor) {
      return doesPieceExist(this.boardState, playerColor, RANK_COMMANDER);
  };
  
  Board.prototype.evaluateMove = function(startSquare, destination) {
      var board = this.boardState;
      // One or more squares is missing pieces
      if (board[startSquare] == null || board[destination] == null) {
          return null;
      }
      var playerPiece = board[startSquare];
      var enemyPiece = board[destination];
      var compareResult = playerPiece.compareRank(enemyPiece);
  
      var compareResultStringMap = new Map();
      compareResultStringMap.set(1, 'capture'); // greater rank
      compareResultStringMap.set(0, 'equal'); // equal rank
      compareResultStringMap.set(-1, 'dies'); // lower rank
  
      if (compareResultStringMap.has(compareResult)) {
        return {
            type          : compareResultStringMap.get(compareResult),
            startSquare   : startSquare,
            endSquare     : destination
        };
      }
  
      return null;
  }
  
  var doesPieceExist = function(boardState, playerColor, pieceRank) {
      var playerSquares = getAllPlayerSquares(boardState, playerColor);
      return playerSquares.some((square) => boardState[square].getRank() == pieceRank);
  }
  

module.exports = chessBoard;

