function flood(element, price, sh, x, y) {
  this.elements = [];
  this.elements.push({
    x: x,
    y: y
  });
  while (this.elements.length != 0) {
    var curr = this.elements.pop();
    var currX = curr.x;
    var currY = curr.y;
    fill(element, price, sh, currX, currY);

    if (isValid(element, price, sh, currX + 1, currY)) {
      elements.push({
        x: currX + 1,
        y: currY
      });
    }
    if (isValid(element, price, sh, currX - 1, currY)) {
      elements.push({
        x: currX - 1,
        y: currY
      });
    }
    if (isValid(element, price, sh, currX, currY + 1)) {
      elements.push({
        x: currX,
        y: currY + 1
      });
    }
    if (isValid(element, price, sh, currX, currY - 1)) {
      elements.push({
        x: currX,
        y: currY - 1
      });
    }
  }
}

function isValid(element, price, sh, x, y) {
  if (x < 0 || y < 0 || x >= map.size.x || y >= map.size.y)
    return false;
  if (park.cash < price)
    return false;
  var tile = map.getTile(x, y);
  var surface = getSurface(tile);
  if (!surface.hasOwnership || surface.baseHeight != sh || surface.slope !== 0)
    return false;
  if (tile.numElements > 1)
    return false;
  return true;
}

function fill(element, price, sh, x, y) {
  if (!isValid(element, price, sh, x, y)) {
    console.log("discard: " + x + ", " + y);
    return;
  }
  console.log("fill: " + x + ", " + y);
  var tile = map.getTile(x, y);
  var surface = getSurface(tile);
  var e = insertTileElement(tile, element.baseHeight, element.clearanceHeight);
  if (e === undefined)
    return;
  e.type = element.type;
  e.object = element.object;
  e.direction = element.direction;
  e.primaryColour = element.primaryColour;
  e.secondaryColour = element.secondaryColour;
  park.cash -= price;
}

function insertTileElement(tile, baseHeight, clearanceHeight) {
  var index = findPlacementPosition(tile, baseHeight, clearanceHeight);
  if (index === undefined)
    return undefined;
  var element = tile.insertElement(index);
  element.baseHeight = baseHeight;
  element.clearanceHeight = clearanceHeight;
  return element;
};

function findPlacementPosition(tile, baseHeight, clearanceHeight) {
  for (var index = 0; index < tile.numElements; index++) {
    var element = tile.getElement(index);
    if (element.baseHeight >= clearanceHeight)
      return index;
    if (element.clearanceHeight > baseHeight)
      return undefined;
  }
  return tile.numElements;
};

function getSurface(tile) {
  for (var index = 0; index < tile.numElements; index++)
    if (tile.elements[index].type === "surface")
      return tile.elements[index];
}


registerPlugin({
  name: 'floodfill',
  version: '1.0',
  authors: ['Sadret', 'inthemanual'],
  type: 'local',
  licence: 'MIT',
  main: function () {
    ui.registerMenuItem("Floodfill tool", function () {
      ui.activateTool({
        id: "floodfill",
        cursor: "cross_hair",
        onMove: function (e) {
          var xyz = e.mapCoords;
          ui.tileSelection.range = {
            leftTop: {
              x: xyz.x,
              y: xyz.y,
            },
            rightBottom: {
              x: xyz.x,
              y: xyz.y,
            }
          };
        },
        onUp: function (e) {
          var xyz = e.mapCoords;
          var idx = e.tileElementIndex;
          console.log("Calling");

          if (xyz === undefined && idx === undefined) {
            console.log("xyz or tileElementIndex undefined");
            ui.tool.cancel();
            return;
          }

          var tile = map.getTile(xyz.x / 32, xyz.y / 32);
          var element = tile.elements[idx];
          var surface = getSurface(tile);
          var object = context.getObject("large_scenery", element.object);

          if (element.type !== "large_scenery")
            return;

          flood(element, object.price * 10, surface.baseHeight, tile.x, tile.y);

          ui.tool.cancel();
          return;
        },
      });
    });
  },
});