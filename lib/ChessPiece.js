// 棋子相关操作

const BOMB = '10', // 炸弹
      COMMANDER = '11', // 司令
      ENGINEER = '19', // 工兵
      MINE = '20', // 地雷
      FLAG = '11'; // 军旗

const LOSE = '-1',
      EVEN = '0',
      WIN = '1';

function ChessPiece(country, rank) {

    this.country = country;
    this.rank = rank;

    this.getCountry = () => this.country;
    this.getRank = () => this.rank;

    this.isFixed = () => {
        return this.rank == MINE || this.rank == FLAG;
    }
}

// zkp
ChessPiece.prototype.collide = function(){
    return EVEN;
}

module.exports = ChessPiece;
