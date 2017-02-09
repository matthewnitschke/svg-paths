function Point(parent){
  var self = this;

  self.x = ko.observable(10);
  self.y = ko.observable(10);

  self.parent = parent;
}

function Path(){
  var self = this;

  self.points = ko.observableArray([]);

  self.isComplete = ko.observable(false);

  self.pathData = ko.computed(function(){
    var retString = "";

    self.points().forEach(function(point){
      var prefix = (retString == "" ? "M" : "L");

      retString += prefix + point.x() + "," + point.y() + " ";
    });

    if (self.isComplete()){
      retString += "Z";
    }

    return retString;
  });

  self.strokeWidth = ko.observable(5);
  self.strokeColor = ko.observable("#000");



  self.points.push(new Point(self));
  self.points.push(new Point(self));

  self.addPoint = function(){
    self.points.push(new Point(self));
  }

  self.movePath = function(mousedownCords, currentCords){

    self.points().forEach(function(point){
      var dy = point.y() - mousedownCords.y;
      point.y(currentCords.y - dy);
    });

  }
}

function viewModel(){
  var self = this;

  var canvasCords = {}
  function updateCanvasCords(){
    canvasCords.x = document.getElementById("svgCanvas").getBoundingClientRect().left;
    canvasCords.y = document.getElementById("svgCanvas").getBoundingClientRect().top;
  }
  updateCanvasCords();

  self.gridSize = ko.observable(10);

  self.paths = ko.observableArray([]);

  self.selectedPath = ko.observable();
  self.selectedPoint = ko.observable();

  var mousedownCords = {};
  self.pathClicked = function(path, e){
    mousedownCords.x = e.x;
    mousedownCords.y = e.y;

    movingPath = path;
    self.selectedPath(path);
  }

  self.pointClicked = function(point, e){
    if (e.ctrlKey){
      self.selectedPoint().x(point.x());
    } else if (e.altKey){
      self.selectedPoint().y(point.y());
    } else {
      movingPoint = point;
      self.selectedPath(point.parent);
      self.selectedPoint(point);
    }

  }
  self.releasePoint = function(){
    movingPoint = null;
  }

  self.addPath = function(){
    self.paths.push(new Path());
  }

  self.viewSource = function(){
    var paths = document.querySelectorAll("#svgCanvas path");

    var retString = "";
    paths.forEach(function(path){
      retString += '<path d="' + path.getAttribute("d") + '"></path>\n'
    })
    document.getElementById("source").innerHTML = retString;
  }


  var movingPoint;
  var movingPath;
  document.addEventListener("mousemove", function(e){
    if (movingPoint){
      var x = Math.round((e.x - canvasCords.x) / self.gridSize()) * self.gridSize();
      var y = Math.round((e.y - canvasCords.y) / self.gridSize()) * self.gridSize();
      movingPoint.x(x);
      movingPoint.y(y);
    } else if(movingPath){
      movingPath.movePath(mousedownCords, {x: e.x, y: e.y});
    }
  });
  document.addEventListener("mouseup", function(e){
    movingPoint = null;
    movingPath = null;
  });

  window.addEventListener("resize", updateCanvasCords);

}


function run(){
  ko.applyBindings(new viewModel());
}
