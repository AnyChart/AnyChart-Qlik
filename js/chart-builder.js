define(["./../config", "./../js/data-adapter"],
    function(config, dataAdapter) {
      return function() {

        var _static = {
          /**
           * 'chartId' : {'chart': Object, 'selected': integer[]}
           */
        };

        this.buildChart = function(view, layout, options) {
          var code = options.code;
          if (!code) return null;

          var self = this;
          var chartId = layout.qInfo.qId;
          var chart;

          if (!_static[chartId]) _static[chartId] = {chart: null};

          _static[chartId]['selected'] = [];

          if (_static[chartId]['chart'] && typeof _static[chartId]['chart']['dispose'] === 'function') {
            anychart['utils']['hideTooltips']();
            _static[chartId]['chart'].dispose();
          }

          // Building chart from chart editor's builded code
          var codeSplit = code.split(/\/\*=rawData.+rawData=\*\//);
          if (codeSplit.length === 2) {

            // Chart creation code
            var code1 = '(function(){' + codeSplit[0] + 'return chart;})();';

            // Data apply and chart settings code
            var code2 = '(function(){ return function(chart, rawData){' + codeSplit[1] + '}})();';

            // Create chart instance
            chart = _static[chartId]['chart'] = eval(code1);

            if (!chart) return null;

            // Apply global settings
            chart['contextMenu'](false);

            if (config.credits.licenseKey && typeof config.credits.licenseKey === 'string') {
              var chartCredits = chart['credits']();
              if (typeof config.credits.enabled === 'boolean')
                chartCredits['enabled'](config.credits.enabled);

              if (typeof config.credits.text === 'string')
                chartCredits['text'](config.credits.text);

              if (typeof config.credits.url === 'string')
                chartCredits['url'](config.credits.url);

              if (typeof config.credits.logoSrc === 'string')
                chartCredits['logoSrc'](config.credits.logoSrc);
            }

            var preparedData = dataAdapter.prepareData(view, layout, options);

            // Process locked series names
            var editorModel = JSON.parse(options.model);
            var lockSeriesName = editorModel['editorSettings'] && editorModel['editorSettings']['lockSeriesName'];

            if (lockSeriesName) {
              for (var k in lockSeriesName) {
                var dataKey = lockSeriesName[k];
                if (dataKey && preparedData.fieldNames[dataKey]) {
                  var getSeries = k.replace('.name()', '');
                  var seriesName = preparedData.fieldNames[dataKey];
                  seriesName = seriesName.replace(/'/g, "\\'");
                  var setting = 'if(chart.' + getSeries + ')chart.' + getSeries + '.name(\'' + seriesName + '\');';

                  var marker = '/*seriesNames=*/';
                  code2 = code2.replace(marker, setting + marker);
                }
              }
            }

            // Apply editor's settings
            var code2func = eval(code2);
            code2func.apply(null, [chart, preparedData.data]);

          } else
            return null;

          // Qlik style interactivity initialization
          var chartType = chart['getType']();
          if ([void 0,'gantt-project', 'gantt-resource', 'sankey', 'stock', 'tree-map', 'circular-gauge', 'linear-gauge'].indexOf(chartType) === -1) {
            chart['interactivity']()['selectionMode']('none');

            _static[chartId]['pointClicked'] = false;
            chart['listen']("mouseDown", function() {
              if (!_static[chartId]['pointClicked']) {
                chart['dispatchEvent']("pointMouseDown");
              }
              _static[chartId]['pointClicked'] = false;
            });

            chart['listen']("pointMouseDown", function(evt) {
              evt.stopPropagation();
              evt.preventDefault();

              if (evt.pointIndex !== void 0) {
                _static[chartId]['pointClicked'] = true;

                if (options.field) {
                  var dimIndex = -1;
                  for (var i = 0; i < preparedData.dimensions.length; i++) {
                    if (preparedData.dimensions[i]['id'] === options.field) {
                      dimIndex = i;
                      break;
                    }
                  }

                  dimIndex = dimIndex < 0 ? 0 : dimIndex;

                  var qElemNumber = preparedData.dimensions[dimIndex]['indexes'][evt.pointIndex];
                  if (typeof qElemNumber === 'number') {
                    view.selectValues(dimIndex, [qElemNumber], true);
                  }
                }

                var index = _static[chartId]['selected'].indexOf(evt.pointIndex);
                if (index === -1) {
                  _static[chartId]['selected'].push(evt.pointIndex);
                } else {
                  _static[chartId]['selected'].splice(index, 1);
                }
              }

              self.updateChartSelections(chartId);
            });

            view.clearSelectedValues = function() {
              _static[chartId]['selected'] = [];
              self.updateChartSelections(chartId);
            };
          }

          // debug
          //window['chart'] = chart;

          return chart;
        };

        this.updateChartSelections = function(chartId) {
          var chart = _static[chartId]['chart'];
          var selected = _static[chartId]['selected'];

          if (typeof chart['getSeriesCount'] === 'function') {
            for (var s = 0; s < chart['getSeriesCount'](); s++) {
              chart['getSeriesAt'](s)['select'](selected);
            }

          } else if (typeof chart['select'] === 'function') {
            chart['select'](selected);

          } else {
            var chartType = chart['getType']();
            switch (chartType) {
              case 'pie':
                chart['explodeSlices'](false);
                for (var i = 0; i < selected.length; i++) {
                  chart['explodeSlice'](selected[i]);
                }
                break;
              default:
                // console.log("Unprocessed chart type " + chartType + " in updateChartSelections()");
                break;
            }
          }
        };
      };
    });