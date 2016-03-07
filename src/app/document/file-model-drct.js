/**
 * Created by paul on 2/27/16.
 */
(function () {
  'use strict';
  angular.module('labDoc').directive('fileModel', ['$parse', function ($parse) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        var model = $parse(attrs.fileModel);
        var modelSetter = model.assign;
        element.bind('change', function () {
          for (var file in element[0].files) {
            //TODO: empty file?
            if (file && (element[0].files[file].name + '').search(/[\#<>$%\*!\`&\'\"\|\{\}\?=\/\\:@\s]/g) >= 0) {
              //TODO: $parent not match
              scope.$parent.fileValid = 'Invalid!.  File name contains special character.';
              return;
            }
          }
          scope.$apply(function () {
            modelSetter(scope, element[0].files);
          });
        });
      }
    };
  }]);

})();
