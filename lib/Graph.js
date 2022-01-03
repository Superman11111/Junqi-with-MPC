const { get } = require("underscore");


var generateNodes = function() {
    nodes = [];
    for(var number = 1; number <= 60; number++) {
        nodes.push(number);
    }
    return nodes;
}

var removeEdges = function(edges, node_1, node_2) {
    edges[node_1].delete(node_2);
    edges[node_2].delete(node_1);
}

var addEdges = function(edges, node) {
    var regularOffset = [-5, 5, -1, 1];
    var leftOffset = [-5, 5, 1];
    var rightOffset = [-5, 5, -1];
    edges[node] = new Set();
    var column = parseInt(node) % 5;
    if(column == 1){
        leftOffset.forEach(function(offset) {
            if(parseInt(node) + offset <= 60 && parseInt(node) + offset >= 1)
                egdes[node].add(parseInt(node) + offset);
        })
    }
    if(column == 0) {
        rightOffset.forEach(function(offset) {
            if(parseInt(node) + offset <= 60 && parseInt(node) + offset >= 1)
                egdes[node].add(parseInt(node) + offset);
        })
    }
    else {
        regularOffset.forEach(function(offset) {
            if(parseInt(node) + offset <= 60 && parseInt(node) + offset >= 1)
                egdes[node].add(parseInt(node) + offset);
        })
    }
}

var camps = [12, 14, 18, 22, 24, 37, 39, 43, 47, 49];

var addCampEdges = function(edges, camps) {
    offsets = [-6, -4, 4, 6];
    camps.forEach(function(camp) {
        offsets.forEach(function(offset) {
            edges[camp].add(camp + offset);
        })
    })
}

var generateEdges = function(nodes) {
    egdes = {};
    nodes.forEach(function(node) {
        addEdges(edges, node);
    })
    addCampEdges(edges,camps);
    removeEdges(edges, 27, 32);
    removeEdges(edges, 29, 34);
    return edges;
}

var generateGraph = function() {
    nodes = generateNodes();
    edges = generateEdges(nodes);
    return {
        nodes: nodes,
        edges: edges
      }   
}

var Graph_Beta = function() {
    var newGraph = generateGraph();

    this.edges = newGraph.edges;
    this.nodes = newGraph.nodes;
}

var graph;

var Graph = function(railways) {
    graph = new Graph_Beta();
    this.railways = railways;
    this.isOnRailway = (currentPosition)
     => this.railways.some((railway) => railway.includes(currentPosition));
}

Graph.prototype.getOnWhichRailway = function(currentPosition) {
    var res = this.railways.filter((railway) => railway.includes(currentSquare)).flat();
    return new Set(res);
}

Graph.prototype.getReachablePosition = function(currentPosition, isEngineer, PiecePositions) {
    if(!this.isOnRailway(currentPosition)) {
        return graph.edges[currentPosition];
    }
    var onTheseRailways = this.getOnWhichRailway(currentPosition);
    
    var reachableEmptyPositions = [];
    var visited = new Set();

    while (reachableEmptyPositions.length != 0)
    {
      var iter = reachableEmptyPositions.shift();
      var nextSquares = graph.edges[iter];
      var nextSquares = Array.from(nextSquares).filter((nextSquare) => this.isOnRailway(nextSquare));
  
      nextSquares.forEach(function(nextSquare) {
        if (visited.has(nextSquare)) {
          return;
        }
          if (isEngineer === false && onTheseRailways.has(nextSquare) === false) {
            return;
          }
  
          visited.add(nextSquare);
  
          if (PiecePositions[nextSquare] === null) {
            reachableEmptyPositions.push(nextSquare);
          }
      });
    }
    var neighbors = graph.edges[iter];
    neighbors.forEach(function(square) {
      visited.add(square);
    });

}
module.exports = Graph;
