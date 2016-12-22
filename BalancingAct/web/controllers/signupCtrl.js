var app = angular.module('interviewIn');

app.controller('SignupCtrl', function($scope, $http) {
	$scope.signup = function($event) {
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
        if ($scope.password != $scope.passwordConfirm) {
        	$scope.error = { message: 'Passwords do not match.' };
        	highlightError(document.getElementById('password'));
        	highlightError(document.getElementById('passwordConfirm'));
            return false;
        }
        var user = {
            email: $scope.email,
            password: $scope.password
        };
        $http.post("/auth/signup", user).then(function (res) {
            window.localStorage.token = res.data.token;
            window.location = "#dashboard";
        }, function (err) {
        	$scope.error = err;
        });
    }

    function error(message) {
    	$scope.error = { message: message };
    }

    function highlightError(field) {
    	field.style.backgroundColor = '#ffdddd';
    }
});
