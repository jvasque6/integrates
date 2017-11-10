/**
 * @file eventualityController.js
 * @author engineering@fluid.la
 */
/**
 * Cambia el formato de una de las columnas de la tabla de eventualidades
 * @function afectacionFormatter
 * @param {String} value
 * @param {Object} row
 * @param {Number} index
 * @return {String}
 */
integrates.afectacionFormatter = function(value, row, index){
    if(value === undefined)
        return "0"; //fix
    if(!isFinite(value))
        if (value.trim() == "")
            return "0";
    return value;
};
/**
 * Calcula la afectacion total para el label resumen
 * @function evntTotalize
 * @param {Object} data
 * @return {undefined}
 */
integrates.evntTotalize = function(data){
    var cardinalidad = 0;
    var afectacion = 0;
    for(var i = 0; i< data.data.length;i++){
        auxAfectacion = 0;
        if (data.data[i].afectacion != ""){
            auxAfectacion += parseInt(data.data[i].afectacion);
        }
        afectacion+=auxAfectacion;
    }
    $("#total_eventualidades").html(data.data.length);
    $("#total_afectacion").html(afectacion);
};
/**
 * Actualiza una fila de la tabla
 * @function updateEvntRow
 * @param {Object} data
 * @return {undefined}
 */
integrates.updateEvntRow = function(row){
    var data = $("#eventualities").bootstrapTable("getData");
    var newData = [];
    for(var i=0; i< data.length;i++){
        delete data[i][i.toString()];
        if(data[i].id == row.id){
            newData.push(row);
        }else{
            newData.push(data[i]);
        }
    }
    $("#eventualities").bootstrapTable("destroy");
    $("#eventualities").bootstrapTable({data: newData});
     $("#eventualities").bootstrapTable("refresh");
    integrates.evntTotalize({data: data});
};
/**
 * Crea el controlador de la funcionalidad de eventualidades
 * @name eventualityController
 * @param {Object} $scope
 * @param {Object} $uibModal
 * @param {integrates.eventualityFactory} eventualityFactory
 * @return {undefined}
 */
integrates.controller("eventualityController", function($scope, $uibModal, $translate, eventualityFactory) {
     var attent_at = $translate.instant('proj_alerts.attent_title');
     var updated_at = $translate.instant('proj_alerts.updated_title');
     var event_at = $translate.instant('proj_alerts.event_title');
     var event_ac1 = $translate.instant('proj_alerts.event_cont1');
     var event_ac2 = $translate.instant('proj_alerts.event_cont2');
     var event_ac3 = $translate.instant('proj_alerts.event_cont3');
     var event_ac4 = $translate.instant('proj_alerts.event_cont4');
     var event_ac5 = $translate.instant('proj_alerts.event_cont5');
     var event_ac6 = $translate.instant('proj_alerts.event_cont6');
     var event_ac7 = $translate.instant('proj_alerts.event_cont7');
     /**
     * Inicializa las variables del controlador de eventualidades
     * @function init
     * @member integrates.eventualityController
     * @return {undefined}
     */
    $scope.init = function(){
        $("#search_section").hide();
        $(".loader").hide();
        document.onkeypress = function(ev){ //asignar funcion a la tecla Enter
            if(ev.keyCode === 13){
                if($('#project').is(':focus')){
                    $scope.searchEvntByName();
                }
            }
        }
        mixpanel.track(
        "SearchEventuality", {
            "Email": userEmail,
            }
        );

    }
    /**
     * Despliega la modal de ver eventualidad
     * @function openModalVer
     * @member integrates.eventualityController
     * @return {undefined}
     */
    $scope.openModalVer = function(){
        var sel = $("#eventualities").bootstrapTable('getSelections');
        if(sel.length == 0){
            $.gritter.add({
                title: 'Error',
                text: event_ac2,
                class_name: 'color warning',
                    sticky: false,
            });
            return false;
        }else{
            $scope.currentEventuality = sel[0];
        }
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'ver.html',
            windowClass: 'ver-modal',
            controller: function($scope, $uibModalInstance, currentEventuality){
                if (currentEventuality.afectacion == ""){
                    currentEventuality.afectacion = "0";
                }
                $scope.evnt = currentEventuality;
                $scope.evnt.afectacion = parseInt(currentEventuality.afectacion);
                $scope.closeModalVer = function(){
                    $uibModalInstance.dismiss('cancel');
                }
            },
            resolve: {
                currentEventuality: function(){
                    return $scope.currentEventuality;
                }
            }
        });
    };
    /**
     * Despliega la modal de ver resumen de eventualidades
     * @function openModalAvance
     * @member integrates.eventualityController
     * @return {undefined}
     */
    $scope.openModalAvance = function(){
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'avance.html',
            windowClass: 'modal avance-modal',
            controller: function($scope, $uibModalInstance){
                $scope.rows = $("#eventualities").bootstrapTable('getData');
                $scope.closeModalAvance = function(){
                    $uibModalInstance.dismiss('cancel');
                }
            },
            resolve: {
                ok: true
            }
        });
    };
    /**
     * Despliega la modal de editar eventualidades
     * @function openModalEditar
     * @member integrates.eventualityController
     * @return {undefined}
     */
    $scope.openModalEditar = function(){
        var sel = $("#eventualities").bootstrapTable('getSelections');
        if(sel.length == 0){
            $.gritter.add({
                title: 'Error',
                text: event_cont2,
                class_name: 'color warning',
                sticky: false,
            });
            return false;
        }else{
            $scope.currentEventuality = sel[0];
        }

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'editar.html',
            windowClass: 'ver-modal',
            controller: function($scope, $uibModalInstance, currentEventuality){
                if (currentEventuality.afectacion == ""){
                    currentEventuality.afectacion = "0";
                }
                $scope.evnt = currentEventuality;
                $scope.evnt.afectacion = parseInt(currentEventuality.afectacion);

                $scope.okModalEditar = function(){
                   submit = false;
                   try{
                       if($scope.evnt.afectacion == undefined){
                           throw "negativo";
                       }
                       submit = true;
                   }catch(e){
                       $.gritter.add({
                            title: attent_at,
                            text: event_ac6,
                            class_name: 'color warning',
                            sticky: false,
                       });
                   }finally{
                       if(submit == false){
                           return false;
                       }
                   }
                   eventualityFactory.updateEvnt($scope.evnt).then(function(response){
                        if(!response.error){
                            $.gritter.add({
                                title: updated_at,
                                text: event_ac7,
                                class_name: 'color success',
                                sticky: false,
                            });
                            integrates.updateEvntRow($scope.evnt);
                            $uibModalInstance.dismiss('cancel');
                        }else{
                            $.gritter.add({
                                title: 'Error!',
                                text: response.message,
                                class_name: 'color warning',
                                sticky: false,
                            });
                        }
                   });
                }

                $scope.closeModalEditar = function(){
                    $uibModalInstance.dismiss('cancel');
                }
            },
            resolve: {
                currentEventuality: function(){
                    return $scope.currentEventuality;
                }
            }
        });
    };
    $scope.category = "Name";
    $scope.setCategory = function(category){
        $scope.category = category;
    }
    /**
     * Busca las eventualidades por nombre de proyecto
     * @function searchEvntByName
     * @member integrates.findingController
     * @return {undefined}
     */
    $scope.searchEvntByName = function(){
        var project = $scope.project;
        var category = $scope.category;
        if (project !== undefined
            && project !== ""
            && category !== undefined
            && category !== ""){
            $scope.response = "";
            $.gritter.add({
                title: event_at,
                text: event_ac1,
                class_name: 'color info',
                sticky: false,
            });
            $(".loader").show();
            $scope.maxRecursiveCall = 5;
            eventualityFactory.getEvntByName(project, category).then(function(data){
                if(!data.error){
                    //CONFIGURACION DE TABLA
                    $("#eventualities").bootstrapTable('destroy');
                    $("#eventualities").bootstrapTable(data);
                    $("#eventualities").bootstrapTable('refresh');
                    //MANEJO DEL UI
                    $("#search_section").show();
                    $('[data-toggle="tooltip"]').tooltip();
                    integrates.evntTotalize(data);
                    $.gritter.add({
                        title: event_at,
                        text: data.message,
                        class_name: 'color success',
                        sticky: false,
                    });
                }else{
                     $.gritter.add({
                        title: 'Error',
                        text: data.message,
                        class_name: 'color warning',
                        sticky: false,
                    });
                }
            }).catch(function(fallback) {
                $.gritter.add({
                    title: event_at,
                    text: event_ac4,
                    class_name: 'color warning',
                    sticky: false,
                });
                if($scope.maxRecursiveCall > 0){
                    $scope.maxRecursiveCall = $scope.maxRecursiveCall - 1;
                    $scope.searchEvntByName();
                }else{
                    $.gritter.add({
                        title: event_at,
                        text: event_ac5,
                        class_name: 'color warning',
                        sticky: false,
                    });
                }
            });
        }else{
            $scope.response = event_ac3 ;
        }
    };

    $scope.init();
});
