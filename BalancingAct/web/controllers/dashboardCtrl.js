var app = angular.module('interviewIn');

app.controller('DashboardCtrl', function($scope, $http) {
    $scope.experiences = [];
    $scope.showExperiences = true;
    $scope.experienceModal = $("#experienceModal");
    $scope.starInfoModal = $("#starInfoModal");
    $scope.starTitle = "Situation";
    $scope.starInformation = "";
    $scope.categoryModal = $("#categoryModal");
    $scope.confirmationModal = $("#confirmationModal");

    $scope.getCategories = function (callback) {
        $http.get("/categories", {
            headers: { 'Authorization': window.localStorage.token }
        }).then(function(res) {
            $scope.categories = res.data.categories;
            for(var cat of $scope.categories) {
                cat.expanded = true;
                cat.experiences = [];
            }
            if(callback)
                callback();
        });
    }

    $scope.addCategory = function () {
        $scope.categoryTitle = "Add new Category";
        $scope.categoryModal.modal();
    }

    $scope.submitCategory = function(newCategory) {
        newCategory = $("#newCategoryName").val();
        if(newCategory == undefined) {return;}
        var newCat = {
          "expanded" : "true",
          "experiences" : [],
          "name" : newCategory
        };
        $http({
            method: "PUT",
            data: newCat,
            url: "/categories",
            headers: { 'Authorization': window.localStorage.token }
        }).then(function(res) {
            var attached = $scope.categories.filter(function(cat) {
                return cat.attached;
            });
            $scope.getCategories(function() {
                for(var cat of $scope.categories) {
                    $scope.getCategoryExperiences(cat);
                    for(var att of attached) {
                        if(cat.name == att.name)
                            cat.attached = true;
                        else
                            cat.attached = false;
                    }
                }
                $scope.categoryModal.modal('hide');
            });
        });
   }

    $scope.toggleCategory = function(category, $event) {
        category.expanded = !category.expanded;
    }

    $scope.getCategoryExperiences = function(category) {
        category.experiences = $scope.experiences.filter(function(exp) {
            return exp.categories.indexOf(category.name) != -1
        });
        if(category.experiences.length > 0)
            category.expanded = true;
    }

    $scope.hasExperiences = function(category) {
        return category.experiences.length > 0;
    }

    $scope.getExperiences = function () {
        $http.get("/experiences", {
            headers: { 'Authorization': window.localStorage.token }
        }).then(function(res) {
            $scope.experiences = res.data;
            for(var cat of $scope.categories) {
                $scope.getCategoryExperiences(cat);
            }
        });
    }

    $scope.addExperience = function(category) {
        $scope.modalTitle = "Add Experience";
        $scope.currentExperience = {
            email: $scope.userEmail,
            categories: [
                category.name
            ]
        };
        category.attached = true;
        $scope.experienceModal.modal();
    }

    $scope.toggleExperienceCategory = function(category) {
        var idx = $scope.currentExperience.categories.indexOf(category.name)
        if(idx == -1) {
            $scope.currentExperience.categories.push(category.name);
            category.attached = true;
        }
        else {
            $scope.currentExperience.categories.splice(idx, 1);
            category.attached = false;
        }
    }

    $scope.ExitModal = function() {
      $scope.starInfoModal.modal('hide');
    }

    $scope.openExperienceModal = function() {
        $scope.modalTitle = "Add Experience";
        $scope.experienceModal.modal();
    }

    $scope.editExperience = function(experience) {
        $scope.modalTitle = "Edit Experience";
        $scope.currentExperience = JSON.parse(JSON.stringify(experience));
        for(var cat of $scope.categories) {
            if(experience.categories.indexOf(cat.name) != -1)
                cat.attached = true;
        }
        $scope.experienceModal.modal();
    }

	$scope.submitExperience = function ($event)
	{
        $event.preventDefault();

        var method;
        if(!$scope.currentExperience.date){
            method = "POST";
            url = "/experiences"
        }
        else {
            method = "PUT";
            url = "/experiences/" + $scope.currentExperience._id
        }

        $scope.currentExperience.date = $("#modalDate").val();
        if(!$scope.currentExperience.name || !$scope.currentExperience.date){
            alert("Please give the experience at least a name and a date.");
            return;
        }
        if($scope.currentExperience.categories.length == 0)
            $scope.currentExperience.categories.push("Miscellaneous");

		$http({
			method: method,
			data: $scope.currentExperience,
			url: url,
            headers: { 'Authorization': window.localStorage.token }
		}).then(function(res) {
            if (res.status == 200){
                if(method == "POST")
                    $scope.experiences.push(res.data);
                else {
                    var exp = $scope.experiences.filter(function(ex) {
                        return ex._id = res.data._id;
                    })[0];
                    $scope.experiences[$scope.experiences.indexOf(exp)] = res.data;
                }
                $scope.currentExperience = null;
                for(var cat of $scope.categories){
                    $scope.getCategoryExperiences(cat);
                    cat.attached = null;
                }
                $scope.experienceModal.modal('hide');
            }
            else {
                console.error("A POST error occurred");
            }
		});
	}

	$scope.deleteExperience = function() {
        var exp = $scope.experiences.filter(function(ex) {
            return ex._id == $scope.currentExperience._id;
        })[0];
        var id = exp._id;
        $http.delete("/experiences/" + id, {
            headers: { 'Authorization': window.localStorage.token }
        }).then(function(res) {
            if (res.status == 200){
                $scope.experiences.splice($scope.experiences.indexOf(exp), 1);
                for(var cat of $scope.categories)
                    $scope.getCategoryExperiences(cat);

                $scope.experienceModal.modal('hide');
            }
            else {
                console.error("A DELETE error occurred");
            }
        })
	}

    $scope.experienceId;
    $scope.confirmModal = function(exp) {
        $scope.confirmationModal.modal();
        $scope.experienceId = exp._id;
    }

    $scope.deleteExperience = function(exp) {
        var id = $scope.experienceId;
        $http.delete("/experiences/" + id, {
            headers: { 'Authorization': window.localStorage.token }
        }).then(function(res) {
            if (res.status == 200){
                $scope.experiences.splice($scope.experiences.indexOf(exp), 1);
                for(var cat of $scope.categories)
                    $scope.getCategoryExperiences(cat);

                $scope.confirmationModal.modal('hide');
            }
            else {
                console.error("A DELETE error occurred");
            }
        })
    }

    $scope.stopPropagation = function($event) {
        $event.stopPropagation();
    }

    /* --Initialize bootstrap components-- */
    $("#modalDate").datepicker();


    /* --Initialize values-- */
    $scope.getCategories($scope.getExperiences);
    $('[data-toggle="tooltip"]').tooltip();
});
