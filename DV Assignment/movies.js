var diameter = 700,
    radius = diameter / 2,
    innerRadius = radius - 120;

var cluster = d3.cluster()
    .size([360, innerRadius]);

var line = d3.radialLine()
    .curve(d3.curveBundle.beta(0.95))
    .radius(function(d) { return d.y; })
    .angle(function(d) { return d.x / 180 * Math.PI; });

var height= window.innerHeight;
var width= window.innerWidth;

var svg = d3.select("body").append("svg")
    .attr("width",window.innerWidth)
    .attr("height",window.innerHeight)
  .append("g")
    .attr("transform", "translate(" + 600 + "," + 300 + ")");

var text4;

text4= svg.selectAll("text4")
    .data([0])
    .enter()
    .append("text")
    .text("Movie Data Visualization")
    .attr("font-family","Papyrus")
    .attr("font-size", "50")
    .attr("fill", "brown")
    .attr("font-weight","bold")
    .attr('transform', 'translate(' + 320 + ',' + 150 + ')');

    var imgs = svg.selectAll("img").data([0]);
            imgs.enter()
                .append("svg:image")
                .attr("xlink:href", "Images/action.jpg")
                .attr("x", "400")
                .attr("y", "-130")
                .attr("width", "550")
                .attr("height", "200");
// var link = svg.append("g").selectAll(".link"),
//     node = svg.append("g").selectAll(".node");
var link;
var node;
var imgs;
var x;
 genre="action.json";
//GetSelectedItem(e1,genre);
imgs = svg.selectAll("img").data([0]);
       imgs.enter()
           .append("svg:image")
           .attr("xlink:href", "Images/action.jpg")
           .attr("x", "400")
           .attr("y", "-130")
           .attr("width", "550")
           .attr("height", "200");


d3.json(genre, function(error, dataset)
{

   link = svg.append("g").selectAll(".link"),
   node = svg.append("g").selectAll(".node");

  if (error) throw error;
console.log("first call");
  var root = packageHierarchy(dataset)
      .sum(function(d) { return d.size; });

  cluster(root);

  link = link
    .data(packageImports(root.leaves()))
    .enter().append("path")
      .each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
      .attr("class", "link")
      .attr("d", line);

  node = node
    .data(root.leaves())
    .enter().append("text")
      .attr("class", "node")
      .attr("dy", "0.31em")
      .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
      .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
      .text(function(d) { return d.data.key; })
      .on("mouseover", mouseovered)
      .on("mouseout", mouseouted);
});

function GetSelectedItem(el)
{
    link.remove();
    node.remove();
    imgs.remove();
    link = svg.append("g").selectAll(".link"),
    node = svg.append("g").selectAll(".node");

    // console.log(e1);
    var e = document.getElementById(el);
    var strSel = e.options[e.selectedIndex].text;
    console.log("iteration");
    genre=strSel+".json";
    console.log(genre);

    x="Images/"+strSel+".jpg"
     imgs = svg.selectAll("img").data([0]);
            imgs.enter()
                .append("svg:image")
                .attr("xlink:href", x)
                .attr("x", "400")
                .attr("y", "-130")
                .attr("width", "550")
                .attr("height", "200");


d3.json(genre, function(error, dataset) {

  if (error) throw error;

  var root = packageHierarchy(dataset)
      .sum(function(d) { return d.size; });

  cluster(root);

  link = link
    .data(packageImports(root.leaves()))
    .enter().append("path")
      .each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
      .attr("class", "link")
      .attr("d", line);

  node = node
    .data(root.leaves())
    .enter().append("text")
      .attr("class", "node")
      .attr("dy", "0.31em")
      .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
      .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
      .text(function(d) { return d.data.key; })
      .on("mouseover", mouseovered)
      .on("mouseout", mouseouted);
});
}
function mouseovered(d) {
  node
      .each(function(n) { n.target = n.source = false; });

  link
      .classed("link--target", function(l) { if (l.target === d) return l.source.source = true; })
      .classed("link--source", function(l) { if (l.source === d) return l.target.target = true; })
      .filter(function(l) { return l.target === d || l.source === d; })
      .raise();

  node
      .classed("node--target", function(n) { return n.target; })
      .classed("node--source", function(n) { return n.source; });
}

function mouseouted(d) {
  link
      .classed("link--target", false)
      .classed("link--source", false);

  node
      .classed("node--target", false)
      .classed("node--source", false);
}


function packageHierarchy(dataset) {
  var map = {};

  function find(name, data) {
    var node = map[name], i;
    if (!node) {
      node = map[name] = data || {name: name, children: []};
      if (name.length) {
        node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
        node.parent.children.push(node);
        node.key = name.substring(i + 1);
      }
    }
    return node;
  }

  dataset.forEach(function(d) {
    find(d.name, d);
  });

  return d3.hierarchy(map[""]);
}

// Return a list of imports for the given array of nodes.
function packageImports(nodes) {
  var map = {},
      imports = [];

  // Compute a map from name to node.
  nodes.forEach(function(d) {
    map[d.data.name] = d;
  });

  // For each import, construct a link from the source to target node.
  nodes.forEach(function(d) {
    if (d.data.imports) d.data.imports.forEach(function(i) {
      imports.push(map[d.data.name].path(map[i]));
    });
  });

  return imports;
}
