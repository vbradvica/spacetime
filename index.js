class ParticleText {
  constructor(opts) {
    this.text = opts.text
    this.opts = opts

    this.pixels = this.rasterizeText(opts)
      .map((d, e, t) => {
        var x = Math.random() * width
        return {
          x: x,
          y: Math.random() * height,
          xTarget: d[0],
          yTarget: d[1],
          rTarget: radius + Math.abs(width / 2 - x) / width * 2 * 2
        }
      })

    this.drawText()
  }

  drawText() {
    var maxR = d3.max(this.pixels, function (d) {
      return d.rTarget
    })
    var color = d3.scaleSequential(d3.interpolateCool)
      .domain([0, 960])

    var mouseNode = {
      x: 0,
      y: height / 2,
      xTarget: width + 50,
      yTarget: height / 2,
      rTarget: 25
    }

    var copyPixels = _.cloneDeep(this.pixels)

    var pText = svg.append("g")
      .attr("class", "circles")
      .selectAll("circle")
      .data(copyPixels)
      .enter()
      .append("rect")
      .classed("mouse", function (d, i) {
        return i == 0
      })
      .attr("x", function (d) {
        return d.x
      })
      .attr("y", function (d) {
        return d.y
      })
      .attr("width", function (d) {
        return d.rTarget * 1.5
      })
      .attr("height", function (d) {
        return d.rTarget * 1.5
      })

    var simulation = d3.forceSimulation([mouseNode].concat(copyPixels))
      .velocityDecay(0.2)
      .force("x", d3.forceX(function (d) {
        return d.xTarget
      }).strength(collisionStrength))
      .force("y", d3.forceY(function (d) {
        return d.yTarget
      }).strength(collisionStrength))
      .force("collide", d3.forceCollide().radius(function (d) {
        return d.rTarget
      }))
      .on("tick", ticked)

    function ticked() {
      pText
        .attr("x", function (d) {
          return d.x
        })
        .attr("y", function (d) {
          return d.y
        })
        .style("fill", function (d) {
          return color(d.x)
        })
    }

    d3.select("#svgTitle")
      .on("mousemove", mousemove)

    function mousemove() {
      var p = d3.mouse(this)
      mouseNode.xTarget = p[0]
      mouseNode.yTarget = p[1]

      simulation
        .force("x", d3.forceX(function (d) {
          return d.xTarget
        }).strength(collisionStrength))
        .force("y", d3.forceY(function (d) {
          return d.yTarget
        }).strength(collisionStrength))
        .alpha(1)
        .restart()
    }
  }

  rasterizeText(options) {
    var o = options || {}

    var fontSize = o.fontSize || "200px",
      fontWeight = o.fontWeight || "600",
      fontFamily = o.fontFamily || "sans-serif",
      textAlign = o.center || "center",
      textBaseline = o.textBaseline || "middle",
      spacing = o.spacing || 10,
      width = o.width || 960,
      height = o.height || 500,
      x = o.x || (width / 2),
      y = o.y || (height / 2)

    var canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height

    var context = canvas.getContext("2d")

    context.font = [fontWeight, fontSize, fontFamily].join(" ")
    context.textAlign = textAlign
    context.textBaseline = textBaseline

    var dx = context.measureText(this.text).width,
      dy = +fontSize.replace("px", ""),
      bBox = [
        [x - dx / 2, y - dy / 2],
        [x + dx / 2, y + dy / 2]
      ]

    context.fillText(this.text, x, y)

    var imageData = context.getImageData(0, 0, width, height)

    var pixels = []
    for (var x = bBox[0][0]; x < bBox[1][0]; x += spacing) {
      for (var y = bBox[0][1]; y < bBox[1][1]; y += spacing) {
        var pixel = this.getPixel(imageData, x, y)
        if (pixel[3] != 0) pixels.push([x, y])
      }
    }

    return pixels
  }

  getPixel(imageData, x, y) {
    var i = 4 * (parseInt(x) + parseInt(y) * imageData.width)
    var d = imageData.data
    return [d[i], d[i + 1], d[i + 2], d[i + 3]]
  }

  loadText(text) {
    d3.select('.circles').remove()
    this.text = text
    this.pixels = this.rasterizeText(this.opts)
      .map(d => {
        var x = Math.random() * width
        return {
          x: x,
          y: Math.random() * height,
          xTarget: d[0],
          yTarget: d[1],
          rTarget: radius + Math.abs(width / 2 - x) / width * 2 * 2
        }
      })

    this.drawText()
  }
}