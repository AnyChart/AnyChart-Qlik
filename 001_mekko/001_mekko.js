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
  baseUrl: 'https://static.anychart.com/demos/editor/AnyChart-Qlik-private/'
  // baseUrl: 'http://127.0.0.1:8080/'
  // paths: {
  //   'plugin': 'http://127.0.0.1:8080/anychart-qlik'
  // }
});

define(['anychart-qlik'], function(plugin) {
  return plugin;
});