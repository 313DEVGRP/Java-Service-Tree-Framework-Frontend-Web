
nv.models.pieChartTotal = function() {

  //============================================================
  // Public Variables with Default Settings
  //------------------------------------------------------------

  var pie = nv.models.pie()
    , legend = nv.models.legend()
    ;

  var margin = {top: 30, right: 20, bottom: 20, left: 20}
    , width = null
    , height = null
    , total = null
    , totalClassName= null
    , isStatus = true
    , status = null
    , statusClassName = null
    , z = null
    , showLegend = true
    , color = nv.utils.defaultColor()
    , tooltips = true
    , tooltip = function(key, y, e, graph) {
        return '<h3>' + key + '</h3>' +
               '<p>' +  y + '</p>'
      }
    , state = {}
    , noData = "No Data Available."
    , dispatch = d3.dispatch('tooltipShow', 'tooltipHide', 'stateChange', 'changeState', 'statusShow', 'statusHide')

    ;

  //============================================================


  //============================================================
  // Private Variables
  //------------------------------------------------------------
  var htmls;
  var showTooltip = function(e, offsetElement) {
    var tooltipLabel = pie.description()(e.point) || pie.x()(e.point)
    var left = e.pos[0] + ( (offsetElement && offsetElement.offsetLeft) || 0 ),
        top = e.pos[1] + ( (offsetElement && offsetElement.offsetTop) || 0),
        y = pie.valueFormat()(pie.y()(e.point)),
        content = tooltip(tooltipLabel, y, e, chart);

    nv.tooltip.show([left, top], content, e.value < 0 ? 'n' : 's', null, offsetElement);
  };

  var showStatus = function(e) {
    var statusLabel = pie.description()(e.point) || pie.x()(e.point);
    var y = pie.valueFormat()(pie.y()(e.point)),
        content = status(statusLabel, y, e, chart);

    d3.select("."+statusClassName).html(content);
  };

  //============================================================

  var totalContent;

  function chart(selection) {
    selection.each(function(data) {
      var container = d3.select(this),
          that = this;

      var availableWidth = (width  || parseInt(container.style('width')) || 960)
                             - margin.left - margin.right,
          availableHeight = (height || parseInt(container.style('height')) || 400)
                             - margin.top - margin.bottom;

      chart.update = function() { chart(selection); };
      chart.container = this;

      //set state.disabled
      state.disabled = data[0].map(function(d) { return !!d.disabled });

      //------------------------------------------------------------
      // Display No Data message if there's nothing to show.

      if (!data[0] || !data[0].length) {
        var noDataText = container.selectAll('.nv-noData').data([noData]);

        noDataText.enter().append('text')
          .attr('class', 'nvd3 nv-noData')
          .attr('dy', '-.7em')
          .style('text-anchor', 'middle');

        noDataText
          .attr('x', margin.left + availableWidth / 2)
          .attr('y', margin.top + availableHeight / 2)
          .text(function(d) { return d });

        return chart;
      } else {
        container.selectAll('.nv-noData').remove();
      }

      //------------------------------------------------------------


      //------------------------------------------------------------
      // Setup containers and skeleton of chart

      var wrap = container.selectAll('g.nv-wrap.nv-pieChart').data([data]);
      var gEnter = wrap.enter().append('g').attr('class', 'nvd3 nv-wrap nv-pieChart').append('g');
      var g = wrap.select('g');

      gEnter.append('g').attr('class', 'nv-pieWrap');
      var htmlWrap = d3.select(container.node().parentNode);
      if (status){
          htmlWrap.selectAll("."+statusClassName).remove();
        var totalCount = d3.sum(data[0].filter(function(d) { return !d.disabled }), pie.y()),
            zCount = z ? d3.sum(data[0].filter(function(d) { return !d.disabled }), chart.z()) : undefined,
            textWrap = htmlWrap.append("div")
                .attr("class", statusClassName)
                .html(total(totalCount, zCount));
            textWrap.attr("style", "left: " + ((parseInt(htmlWrap.style("width")) / 2) - (parseInt(textWrap.style("width")) / 2)) +"px;"
                + "top: " + ((parseInt(htmlWrap.style("height")) / 2) - (parseInt(textWrap.style("height")) / 2)) + "px" + ";");
      }
      gEnter.append('g').attr('class', 'nv-legendWrap');

      totalContent = d3.select("."+statusClassName).select("."+totalClassName).node().outerHTML;

      //------------------------------------------------------------


      //------------------------------------------------------------
      // Legend

      if (showLegend) {
        legend
          .width( availableWidth )
          .key(pie.x());

        wrap.select('.nv-legendWrap')
            .datum(pie.values()(data[0]))
            .call(legend);

        if ( margin.top != legend.height()) {
          margin.top = legend.height();
          availableHeight = (height || parseInt(container.style('height')) || 400)
                             - margin.top - margin.bottom;
        }

        wrap.select('.nv-legendWrap')
            .attr('transform', 'translate(0,' + (-margin.top) +')');
      }

      //------------------------------------------------------------


      wrap.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


      //------------------------------------------------------------
      // Main Chart Component(s)

      pie
        .width(availableWidth)
        .height(availableHeight);


      var pieWrap = g.select('.nv-pieWrap')
          .datum(data);

      d3.transition(pieWrap).call(pie);

      //------------------------------------------------------------


      //============================================================
      // Event Handling/Dispatching (in chart's scope)
      //------------------------------------------------------------

      legend.dispatch.on('legendClick', function(d,i, that) {
        d.disabled = !d.disabled;

        if (!pie.values()(data[0]).filter(function(d) { return !d.disabled }).length) {
          pie.values()(data[0]).map(function(d) {
            d.disabled = false;
            wrap.selectAll('.nv-series').classed('disabled', false);
            return d;
          });
        }

        state.disabled = data[0].map(function(d) { return !!d.disabled });
        dispatch.stateChange(state);

        selection.transition().call(chart)
      });

      pie.dispatch.on('elementMouseout.tooltip', function(e) {
        dispatch.tooltipHide(e);
      });

      // Update chart from a state object passed to event handler
      dispatch.on('changeState', function(e) {

        if (typeof e.disabled !== 'undefined') {
          data[0].forEach(function(series,i) {
            series.disabled = e.disabled[i];
          });

          state.disabled = e.disabled;
        }

        selection.call(chart);
      });

      //============================================================


    });

    return chart;
  }

  //============================================================
  // Event Handling/Dispatching (out of chart's scope)
  //------------------------------------------------------------

  pie.dispatch.on('elementMouseover.tooltip', function(e) {
    e.pos = [e.pos[0] +  margin.left, e.pos[1] + margin.top];
    dispatch.tooltipShow(e);
  });

  dispatch.on('tooltipShow', function(e) {
    if (tooltips) showTooltip(e);
  });

  dispatch.on('tooltipHide', function() {
    if (tooltips) nv.tooltip.cleanup();
  });

  pie.dispatch.on('elementMouseover.status', function(e) {
    e.pos = [e.pos[0] +  margin.left, e.pos[1] + margin.top];
    dispatch.statusShow(e);
  });

  dispatch.on('statusShow', function(e) {
    if (isStatus) showStatus(e);
  });

  pie.dispatch.on('elementMouseout.status', function(e) {
    dispatch.statusHide(e);
  });

  dispatch.on('statusHide', function() {
    if (isStatus) d3.select("."+statusClassName).html(totalContent);
  });

  //============================================================


  //============================================================
  // Expose Public Variables
  //------------------------------------------------------------

  // expose chart's sub-components
  chart.legend = legend;
  chart.dispatch = dispatch;
  chart.pie = pie;

  d3.rebind(chart, pie, 'valueFormat', 'values', 'x', 'y', 'description', 'id', 'showLabels', 'donutLabelsOutside', 'pieLabelsOutside', 'donut', 'donutRatio', 'labelThreshold');

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin.top    = typeof _.top    != 'undefined' ? _.top    : margin.top;
    margin.right  = typeof _.right  != 'undefined' ? _.right  : margin.right;
    margin.bottom = typeof _.bottom != 'undefined' ? _.bottom : margin.bottom;
    margin.left   = typeof _.left   != 'undefined' ? _.left   : margin.left;
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.color = function(_) {
    if (!arguments.length) return color;
    color = nv.utils.getColor(_);
    legend.color(color);
    pie.color(color);
    return chart;
  };

  chart.showLegend = function(_) {
    if (!arguments.length) return showLegend;
    showLegend = _;
    return chart;
  };

  chart.tooltips = function(_) {
    if (!arguments.length) return tooltips;
    tooltips = _;
    return chart;
  };

  chart.tooltipContent = function(_) {
    if (!arguments.length) return tooltip;
    tooltip = _;
    return chart;
  };

  chart.total = function(_) {
    if (!arguments.length) return total;
    total = _;
    return chart;
  };

  chart.totalClassName = function(_) {
    if (!arguments.length) return totalClassName;
    totalClassName = _;
    return chart;
  };

  chart.status = function(_) {
    if (!arguments.length) return status;
    status = _;
    return chart;
  }

  chart.statusClassName = function(_) {
    if (!arguments.length) return statusClassName;
    statusClassName = _;
    return chart;
  }

  chart.state = function(_) {
    if (!arguments.length) return state;
    state = _;
    return chart;
  };

  chart.noData = function(_) {
    if (!arguments.length) return noData;
    noData = _;
    return chart;
  };

    chart.z = function(_) {
        if (!arguments.length) return z;
        z = _;
        return chart;
    };

  //============================================================


  return chart;
}
