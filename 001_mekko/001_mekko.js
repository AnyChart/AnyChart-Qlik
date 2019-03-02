requirejs.config({
  config: {
    'plugin': {
      // localization: {
      //   // inputLocale: "",
      //   // outputLocale: "",
      //   // inputDateTimeFormat: "",
      //   // outputDateFormat: "",
      //   // outputDateTimeFormat: "",
      //   // outputTimeFormat: "",
      //   // outputTimezone: ""
      // },

      type: 'mekko',
      minDimentions: 1,
      minMeasures: 1
    }
  },
  paths: {
    'plugin': 'http://127.0.0.1:8080/anychart-qlik'
  }
});

define([
    'css!./css/style.css',
    'css!./css/anychart-editor.min.css',
    'css!./css/anychart-font.min.css',
    'css!./css/anychart-ui.min.css',

    'plugin'
],function(css1, css2, css3, css4, plugin){
  return plugin;
});