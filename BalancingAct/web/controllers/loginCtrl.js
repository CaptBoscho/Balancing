var app = angular.module('interviewIn');

app.controller('LoginCtrl', function($scope, $http) {
    $scope.login = function($event) {
        $event.preventDefault();
        if ($scope.email == null || $scope.email == '') {
        	error('No email was provided.');
        	highlightError(document.getElementById('email'));
        	return false;
        }
        if ($scope.password == null || $scope.password == '') {
        	error('No password was provided.');
        	highlightError(document.getElementById('password'));
        	return false;
        }
        var user = {
            email: $scope.email,
            password: $scope.password
        };
        $http.post("/auth/login", user).then(function (res) {
            window.localStorage.token = res.data.token;
            window.location = "#dashboard";
        }, function (err) {
        	error('The username and password do not match any user in the database.');
        });
    };

    function error(message) {
    	$scope.error = { message: message };
    }

    function highlightError(field) {
    	field.style.backgroundColor = '#ffdddd';
    }
});
