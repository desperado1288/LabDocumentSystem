/**
 * Created by dingyi on 2/23/16.
 */
(function () {
  'use strict';

  function UploadPDFCtrl($scope, $rootScope, $sce, $log, uploadService, $location, filesService) {
    //$scope.curr = $rootScope.globals.currentUser.username;
    $scope.customer = {};
    $scope.response = {};

    //set username first to ensure the sequence in FormData,
    //so that server can detect username first to create directory
    $scope.customer.name = $scope.user.username;
    $scope.customer.nameVaild = '';
    $scope.customer.fileValid = 'No file yet';
    $scope.response.status = 'Not upload yet';
    $scope.customer.username = $scope.user.username;

    $scope.fileUpload = function () {
      if ($scope.customer.username === '') {
        $scope.customer.nameValid = 'Username cannot be empty!';
        return;
      } else if ($scope.customer.username.search(/[\#<>$%\*!\`&\'\"\|\{\}\?=\/\\:@\s]/g) >= 0) {
        $scope.customer.nameValid = 'Invalid!  Username contains characters';
        return;
      }
      $scope.customer.nameValid = '';
      uploadService.post($scope.customer)
        .then(function (response) {
          $scope.response = response;
        }, function (err) {
          $scope.error = err;
          if (err.status === 401) {
            $location.path('/login');
          }
        });
    };

    $scope.getFiles = function () {
      if ($scope.customer.name === '') {
        $scope.customer.nameValid = 'Username cannot be empty!';
        return;
      } else if ($scope.customer.name.search(/[\#<>$%\*!\`&\'\"\|\{\}\?=\/\\:@\s]/g) >= 0) {
        $scope.customer.nameValid = 'Invalid!  Username contains characters';
        return;
      }
      $scope.customer.nameValid = '';
      filesService.getFilenames($scope.customer.name)
        .then(
          function (response) {
            $scope.customer.filenames = response.data;
          },
          function (err) {
            $log.error(err);
          }
      );
    };

    $scope.readFile = function (filename) {
      filesService.getFileByUserAndFilename(filename, $scope.customer.name)
        .then(
          function (response) {
            var file = new Blob([response], { type: 'application/pdf' });
            var fileURL = URL.createObjectURL(file);
            $scope.customer.url = $sce.trustAsResourceUrl(fileURL);
            $scope.customer.isLoading = false;
            $scope.customer.info = '';
          },
          function (data) {
            $scope.customer.isLoading = false;
            $scope.customer.info = JSON.stringify(data);
          }
      );
    };

    function isNameValid(name) {
      if (name === '') {
        $scope.customer.nameValid = 'Username cannot be empty!';
        return;
      } else if (name.search(/[\#<>$%\*!\`&\'\"\|\{\}\?=\/\\:@\s]/g) >= 0) {
        $scope.customer.nameValid = 'Invalid!  Username contains characters';
        return;
      }
    }
  }

  angular.module('labDoc').controller('UploadPDFCtrl', UploadPDFCtrl);

})();
