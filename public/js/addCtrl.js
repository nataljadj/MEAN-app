/*
 * addCtrl.js
 * Date of creation: 22.12.2015
 *
 * Copyright (c) CompuGroup Medical Software GmbH,
 * This software is the confidential and proprietary information of
 * CompuGroup Medical Software GmbH. You shall not disclose such confidential
 * information and shall use it only in accordance with the terms of
 * the license agreement you entered into with CompuGroup Medical Software GmbH.
 */
// Creates the addCtrl Module and Controller. Note that it depends on the 'geolocation' module and service.
var addCtrl = angular.module('addCtrl', ['geolocation', 'gservice']);
addCtrl.controller('addCtrl', [
    '$scope',
    '$rootScope',
    '$http',
    'geolocation',
    'gservice',
    '$timeout',
    function ($scope,
              $rootScope,
              $http,
              geolocation,
              gservice,
              $timeout) {

        // Initializes Variables
        // ----------------------------------------------------------------------------
        $scope.formData = {};
        var coords = {};
        var lat = 0;
        var long = 0;

        // Set initial coordinates to the center of the US
        $scope.formData.latitude = 39.500;
        $scope.formData.longitude = -98.350;

        $rootScope.$on("clicked", function () {
            // Run the gservice functions associated with identifying coordinates
            $timeout(function () {
                $scope.$apply(function () {
                    $scope.formData.latitude = parseFloat(gservice.clickLat).toFixed(3);
                    $scope.formData.longitude = parseFloat(gservice.clickLong).toFixed(3);
                    $scope.formData.htmlverified = "Nope (Thanks for spamming my map...)";
                });
            });
        });

        // Get User's actual coordinates based on HTML5 at window load
        geolocation.getLocation().then(function(data){
            coords = {
                lat: data.coords.latitude,
                long: data.coords.longitude
            };

            // Display coordinates in location textboxes rounded to three decimal points
            $scope.formData.longitude = parseFloat(coords.long).toFixed(3);
            $scope.formData.latitude = parseFloat(coords.lat).toFixed(3);

            $scope.formData.htmlverified = "Yep (Thanks for giving us real data!)";
            gservice.refresh($scope.formData.latitude, $scope.formData.longitude);
        });

        // Functions
        // ----------------------------------------------------------------------------
        // Creates a new user based on the form fields
        $scope.createUser = function () {

            // Grabs all of the text box fields
            var userData = {
                username: $scope.formData.username,
                gender: $scope.formData.gender,
                age: $scope.formData.age,
                favlang: $scope.formData.favlang,
                location: [$scope.formData.longitude, $scope.formData.latitude],
                htmlverified: $scope.formData.htmlverified
            };

            // Saves the user data to the db
            $http.post('/users', userData)
                .success(function (data) {
                    // Refresh the map with new data
                    gservice.refresh($scope.formData.latitude, $scope.formData.longitude);

                    // Once complete, clear the form (except location)
                    $scope.formData.username = "";
                    $scope.formData.gender = "";
                    $scope.formData.age = "";
                    $scope.formData.favlang = "";

                })
                .error(function (data) {
                    console.log('Error: ' + data);
                });
        };
    }]);