/* eslint no-magic-numbers: ["error", { "ignore": [-1,0,0.4,0.6,1,1.176,1.5,2,4,4.611,10,10.41,13,20,43.221,100,200,300,1000,3000] }]*/
/* global
BASE, downLink:true, Morris, estado:true, exploitLabel:true, nonexploitLabel:true, total_higLabel:true,
explotable:true, total_segLabel:true, openLabel:true, partialLabel:true, integrates, userRole, document, $, $msg, userName,
userEmail, Rollbar, aux:true, json:true, closeLabel:true, mixPanelDashboard, win:true, window, Organization, i:true, j:true
*/
/* eslint-env node*/
/**
 * @file ProjectCtrl.js
 * @author engineering@fluidattacks.com
 */
/* Table Formatter */
/**
 * Function removeHour return date without hour
 */
function removeHour (value, row, index) {
  if (value.indexOf(":") !== -1) {
    return value.split(" ")[0];
  }
  return value;
}

/**
 * Function labelState return html code for specific label
 */
function labelState (value, row, index) {
  if (value === "Cerrado") {
    return "<label class='label label-success' style='background-color: #31c0be'>Cerrado</label>";
  }
  else if (value === "Closed") {
    return "<label class='label label-success' style='background-color: #31c0be'>Closed</label>";
  }
  else if (value === "Abierto") {
    return "<label class='label label-danger' style='background-color: #f22;'>Abierto</label>";
  }
  else if (value === "Open") {
    return "<label class='label label-danger' style='background-color: #f22;'>Open</label>";
  }
  else if (value === "Parcialmente cerrado") {
    return "<label class='label label-info' style='background-color: #ffbf00'>Parcialmente cerrado</label>";
  }
  return "<label class='label label-info' style='background-color: #ffbf00'>Partially closed</label>";
}

/**
 * Controlador de vista de proyectos
 * @name ProjectCtrl
 * @param {Object} $scope
 * @param {Object} $uibModal
 * @param {Object} $stateParams
 * @param {Object} $state
 * @param {Object} $timeout
 * @return {undefined}
 */
/** @export */
integrates.controller(
  "projectCtrl",
  function (
    $scope, $location,
    $uibModal, $timeout,
    $state, $stateParams,
    $translate, projectFtry
  ) {
    $scope.init = function () {
      const project = $stateParams.project;
      const findingId = $stateParams.finding;
      $scope.userRole = userRole;
      // Control para alternar los campos editables
      $scope.onlyReadableTab1 = true;
      $scope.onlyReadableTab2 = true;
      $scope.onlyReadableTab3 = true;
      $scope.isManager = userRole !== "customer";
      // Defaults para cambiar vistas
      $scope.view = {};
      $scope.view.project = false;
      $scope.view.finding = false;
      // Parametros de ruta
      if (typeof findingId !== "undefined") {
        $scope.findingId = findingId;
      }
      if (typeof project !== "undefined" &&
                project !== "") {
        $scope.project = project;
        $scope.search();
        const org = Organization.toUpperCase();
        const projt = project.toUpperCase();
        $(".equalWidgetHeight").matchHeight();
        if (window.location.hash.indexOf("indicators") !== -1) {
          $("#indicatorsTab").addClass("active");
          $("#indicators").addClass("active");
          $("#findingsTab").removeClass("active");
          $("#findings").removeClass("active");
          $("#eventsTab").removeClass("active");
          $("#eventualities").removeClass("active");
          // Tracking mixpanel
          mixPanelDashboard.trackReports("ProjectIndicators", userName, userEmail, org, projt);
        }
        if (window.location.hash.indexOf("findings") !== -1) {
          $("#indicatorsTab").removeClass("active");
          $("#indicators").removeClass("active");
          $("#findingsTab").addClass("active");
          $("#findings").addClass("active");
          $("#eventsTab").removeClass("active");
          $("#eventualities").removeClass("active");
          // Tracking mixpanel
          mixPanelDashboard.trackReports("ProjectFindings", userName, userEmail, org, projt);
        }
        if (window.location.hash.indexOf("events") !== -1) {
          $("#indicatorsTab").removeClass("active");
          $("#indicators").removeClass("active");
          $("#findingsTab").removeClass("active");
          $("#findings").removeClass("active");
          $("#eventsTab").addClass("active");
          $("#eventualities").addClass("active");
          // Tracking mixpanel
          mixPanelDashboard.trackReports("ProjectEvents", userName, userEmail, org, projt);
        }
      }
      // Inicializacion para consulta de hallazgos
      $scope.configColorPalette();
      // Asigna el evento buscar al textbox search y tecla enter
      $scope.configKeyboardView();
      $scope.goUp();
      $scope.finding = {};
    };
    $scope.goUp = function () {
      $("html, body").animate({"scrollTop": 0}, "fast");
    };
    $scope.goBack = function () {
      $scope.view.project = true;
      $scope.view.finding = false;
      $scope.mainGraphexploitPieChart();
      $scope.mainGraphtypePieChart();
      $scope.mainGraphstatusPieChart();
      $("html, body").animate({"scrollTop": $scope.currentScrollPosition}, "fast");
    };
    $scope.alertHeader = function (company, project) {
      const req = projectFtry.getAlerts(company, project);
      req.then(function (response) {
        if (!response.error && response.data.length > 0) {
          if (response.data.status_act === "1") {
            let html = "<div class=\"alert alert-danger-2\">";
            html += `<strong>Atención! </strong>${response.data[0].message}</div>`;
            document.getElementById("header_alert").innerHTML = html;
          }
        }
      });
    };
    $scope.testFinding = function () {
      $scope.finding = {
        "actor": "Praesent pharetra metus eget diam dignissim facilisis",
        "amenaza": "Maecenas eget metus nec nibh blandit sollicitudin vel convallis diam. Maecenas vestibulum augue vitae risus tincidunt",
        "autenticacion": "0324 | Ninguna",
        "cardinalidad": "1023",
        "categoria": "Fusce iaculis, dolor nec maximus molestie, nisi leo malesuada libero",
        "complejidad_acceso": "4542 | Facil",
        "criticidad": "5.1",
        "cssv2base": "4.3",
        "cwe": "https://fluidattacks.com",
        "debilidad": "Fusce iaculis, dolor nec maximus molestie, nisi leo malesuada libero",
        "donde": "Pellentesque quis sapien luctus, fermentum mauris ac, tincidunt urna. Praesent pharetra metus eget diam dignissim facilisis. Phasellus in dictum dolor, elementum pharetra neque. Duis molestie, dui sit amet dictum efficitur, dolor arcu cursus metus, tempor bibendum justo sem quis velit. Nam sed sem id libero scelerisque pretium sit amet rhoncus diam. In eleifend diam felis, eget rutrum mi tempus a. In ex neque, vehicula vitae congue in, sodales non massa",
        "escenario": "Nunc ut nibh non neque semper ornare id sit amet ipsum.",
        "explotabilidad": "0435 | Conceptual",
        "hallazgo": "FIN. 0001 Ejecución Remota de Comandos",
        "impacto_confidencialidad": "0324 | Alto: Aqui va un texto 1",
        "impacto_disponibilidad": "0324 | Alto: Aqui va un texto 3",
        "impacto_integridad": "0324 | Alto: Aqui va un texto 2",
        "nivel_confianza": "4543 | Confirmado",
        "nivel_resolucion": "0233 | Existe porque va un texto 4",
        "probabilidad": "75% Fácil de vulnerar",
        "proyecto_cliente": "Integrates",
        "proyecto_fluid": "Integrates",
        "requisitos": "REQ000X. Maecenas vitae molestie arcu. Sed ut enim eu mauris fermentum malesuada sed non magna.",
        "severidad": "5",
        "sistema_comprometido": "Stiam dapibus ultrices ligula a convallis.",
        "solucion_efecto": "Etiam dapibus ultrices ligula a convallis. Vivamus ultricies convallis magna. Praesent metus sem, porttitor sed risus quis, fringilla rutrum arcu.",
        "timestamp": "04/06/2017 12:40:24",
        "tipo_prueba": "Aplicación",
        "valor_riesgo": "(3.0) Crítico",
        "vector_acceso": "0343 | Red Adyacente",
        "vector_ataque": "Praesent porta congue lorem sit amet rhoncus. ",
        "vulnerabilidad": "Pellentesque quis sapien luctus, fermentum mauris ac, tincidunt urna. Praesent pharetra metus eget diam dignissim facilisis. Phasellus in dictum dolor, elementum pharetra neque. Duis molestie, dui sit amet dictum efficitur, dolor arcu cursus metus, tempor bibendum justo sem quis velit. Nam sed sem id libero scelerisque pretium sit amet rhoncus diam. In eleifend diam felis, eget rutrum mi tempus a. In ex neque, vehicula vitae congue in, sodales non massa."
      };
      // Begin current Date
      const today = new Date();
      let dd = today.getDate();
      // January is 0!
      let mm = today.getMonth() + 1;
      const yyyy = today.getFullYear();
      if (dd < 10) {
        dd = `0${dd}`;
      }
      if (mm < 10) {
        mm = `0${mm}`;
      }
      const new_today = `${dd}/${mm}/${yyyy}`;
      $scope.header = {
        "finding": new_today,
        "findingCount": $scope.finding.cardinalidad,
        "findingID": "323932433",
        "findingState": "Abierto",
        "findingStateColor": $scope.colors.critical,
        "findingTitle": $scope.finding.hallazgo,
        "findingType": $scope.finding.tipo_prueba,
        "findingValue": "8.0",
        "findingValueColor": $scope.colors.critical,
        "findingValueDescription": "(Alto)"
      };
    };
    $scope.calculateCardinality = function (data) {
      let total_severity = 0;
      let cardinalidad = 0;
      let cardinalidad_total = 0;
      data.data.forEach(function (cont) {
        cardinalidad += parseInt(cont.cardinalidad, 10);
        cardinalidad_total += parseInt(cont.cardinalidad_total, 10);
      });
      $scope.metricsList = [];
      $scope.metricsList.push({
        "color": "background-color: #2197d6;",
        "description": $translate.instant("search_findings.filter_labels.findings"),
        "icon": "s7-id",
        "value": data.data.length
      });
      $scope.metricsList.push({
        "color": "background-color: #aa2d30;",
        "description": $translate.instant("search_findings.filter_labels.cardinalities"),
        "icon": "s7-unlock",
        "value": cardinalidad
      });
      let severity = 0;
      data.data.forEach(function (cont) {
        try {
          if (cont.tipo_hallazgo === "Seguridad") {
            const ImpCon = parseFloat(cont.impacto_confidencialidad.split(" | ")[0]);
            const ImpInt = parseFloat(cont.impacto_integridad.split(" | ")[0]);
            const ImpDis = parseFloat(cont.impacto_disponibilidad.split(" | ")[0]);
            const AccCom = parseFloat(cont.complejidad_acceso.split(" | ")[0]);
            const AccVec = parseFloat(cont.vector_acceso.split(" | ")[0]);
            const Auth = parseFloat(cont.autenticacion.split(" | ")[0]);
            const Explo = parseFloat(cont.explotabilidad.split(" | ")[0]);
            const Resol = parseFloat(cont.nivel_resolucion.split(" | ")[0]);
            const Confi = parseFloat(cont.nivel_confianza.split(" | ")[0]);
            const BaseScore = ((0.6 * (10.41 * (1 - ((1 - ImpCon) * (1 - ImpInt) * (1 - ImpDis))))) + (0.4 * (20 * AccCom * Auth * AccVec)) - 1.5) * 1.176;
            severity += BaseScore * parseFloat(cont.cardinalidad_total);
          }
        }
        catch (err) {
          Rollbar.error("Error: An error ocurred calculating cardinality", err);
        }
      });
      const req = projectFtry.TotalSeverity($scope.project.toLowerCase());
      req.then(function (response) {
        if (!response.error) {
          if (response.data.length > 0) {
            for (let cont = 0; cont < response.data.length; cont++) {
              const target = (parseInt(response.data[cont].lines, 10) / 1000) + (parseInt(response.data[cont].fields, 10) / 4);
              total_severity = severity / ((4.611 * target) + 43.221) * 100;
              $scope.metricsList.push({
                "color": "background-color: #ef4c43;",
                "description": $translate.instant("search_findings.filter_labels.criticity"),
                "icon": "s7-graph1",
                "value": "n%".replace("n", total_severity.toFixed(0))
              });
              $scope.metricsList.push({
                "color": "background-color: #00cb77;",
                "description": $translate.instant("search_findings.filter_labels.closure"),
                "icon": "s7-like2",
                "value": "n%".replace("n", ((1 - (cardinalidad / cardinalidad_total)) * 100).toFixed(2).toString())
              });
            }
          }
          else {
            total_severity = severity;
            $scope.metricsList.push({
              "color": "background-color: #ef4c43;",
              "description": $translate.instant("search_findings.filter_labels.criticity"),
              "icon": "s7-graph1",
              "value": total_severity.toFixed(0)
            });
            $scope.metricsList.push({
              "color": "background-color: #00cb77;",
              "description": $translate.instant("search_findings.filter_labels.closure"),
              "icon": "s7-like2",
              "value": "n%".replace("n", ((1 - (cardinalidad / cardinalidad_total)) * 100).toFixed(2).toString())
            });
          }
        }
      });
    };
    $scope.configColorPalette = function () {
      $scope.colors = {};
      // Red
      $scope.colors.critical = "background-color: #f12;";
      // Orange
      $scope.colors.moderate = "background-color: #f72;";
      // Yellow
      $scope.colors.tolerable = "background-color: #ffbf00;";
      // Green
      $scope.colors.ok = "background-color: #008000;";
    };
    $scope.configKeyboardView = function () {
      document.onkeypress = function (ev) {
        // Buscar un proyecto
        if (ev.keyCode === 13) {
          if ($("#project").is(":focus")) {
            $scope.search();
          }
        }
      };
    };
    $scope.generateFullDoc = function () {
      const project = $scope.project;
      const data = $("#vulnerabilities").bootstrapTable("getData");
      for (let cont = 0; cont < data.length - 1; cont++) {
        for (j = cont + 1; j < data.length; j++) {
          if (parseFloat(data[cont].criticidad) < parseFloat(data[j].criticidad)) {
            aux = data[cont];
            data[cont] = data[j];
            data[j] = aux;
          }
        }
      }
      let generateDoc = true;
      try {
        json = data;
        generateDoc = true;
        const err = "error";
        // Remove indices
        json = JSON.stringify(JSON.parse(JSON.stringify(json)));
        if (typeof json === "undefined") {
          throw err;
        }
        if (json === [] || json === {}) {
          throw err;
        }
        if (project.trim() === "") {
          throw err;
        }
      }
      catch (err) {
        Rollbar.error("Error: An error ocurred generating document", err);
        generateDoc = false;
      }
      if (generateDoc === false) {
        return false;
      }
      const req = projectFtry.ProjectDoc(project, json, "IT");
      req.then(function (response) {
        if (!response.error) {
          let url = `${BASE.url}export_autodoc?project=${$scope.project}`;
          url += "&format=IT";
          if (navigator.userAgent.indexOf("Firefox") === -1) {
            $scope.downloadURL = url;
          }
          else {
            win = window.open(url, "__blank");
          }
        }
        else if (response.error) {
          Rollbar.error("Error: An error ocurred generating document");
        }
      });
      $scope.downloadDoc();
    };
    $scope.technicalReportModal = function () {
      // Tracking mixpanel
      const org = Organization.toUpperCase();
      const projt = $scope.project.toUpperCase();
      mixPanelDashboard.trackReports("TechnicalReports", userName, userEmail, org, projt);
      const modalInstance = $uibModal.open({
        "animation": true,
        "controller" ($scope, $uibModalInstance, $stateParams, projectFtry) {
          $scope.findingMatrizXLSReport = function () {
            const project = $stateParams.project;
            const lang = localStorage.lang;
            const prjpatt = new RegExp("^[a-zA-Z0-9_]+$");
            const langpatt = new RegExp("^en|es$");
            if (prjpatt.test(project) &&
                            langpatt.test(lang)) {
              // Tracking mixpanel
              mixPanelDashboard.trackReports("TechnicalReportXLS", userName, userEmail, org, projt);
              const url = `${BASE.url}xls/${lang}/project/${project}`;
              if (navigator.userAgent.indexOf("Firefox") === -1) {
                downLink = document.createElement("a");
                downLink.target = "_blank";
                downLink.href = url;
                downLink.click();
              }
              else {
                win = window.open(url, "__blank");
              }
            }
          };
          $scope.findingMatrizPDFReport = function () {
            const project = $stateParams.project;
            const lang = localStorage.lang;
            const prjpatt = new RegExp("^[a-zA-Z0-9_]+$");
            const langpatt = new RegExp("^en|es$");
            if (prjpatt.test(project) &&
                            langpatt.test(lang)) {
              // Tracking mixpanel
              mixPanelDashboard.trackReports("TechnicalReportPDF", userName, userEmail, org, projt);
              const url = `${BASE.url}pdf/${lang}/project/${project}/tech/`;
              if (navigator.userAgent.indexOf("Firefox") === -1) {
                downLink = document.createElement("a");
                downLink.target = "_blank";
                downLink.href = url;
                downLink.click();
              }
              else {
                win = window.open(url, "__blank");
              }
            }
          };
          $scope.closeModalAvance = function () {
            $uibModalInstance.close();
          };
        },
        "keyboard": false,
        "resolve": {"ok": true},
        "templateUrl": "technicalReportModal.html",
        "windowClass": "modal avance-modal"
      });
    };
    $scope.executiveReportModal = function () {
      // Tracking mixpanel
      const org = Organization.toUpperCase();
      const projt = $scope.project.toUpperCase();
      mixPanelDashboard.trackReports("ExecutiveReports", userName, userEmail, org, projt);
      const modalInstance = $uibModal.open({
        "animation": true,
        "controller" ($scope, $uibModalInstance, $stateParams) {
          $("#hasPresentation").hide();
          $("#hasPresentationMsg").show();
          $scope.init = function () {
            $("#hasPresentation").hide();
            $("#hasPresentationMsg").show();
            $.get(`${BASE.url}check_pdf/project/${$stateParams.project}`, function (cont) {
              if (!cont.error) {
                if (cont.data.enable) {
                  $("#hasPresentation").show();
                  $("#hasPresentationMsg").hide();
                }
              }
              else if (cont.error) {
                Rollbar.error("Error: An error ocurred generating the executive report");
              }
            });
          };
          $scope.findingMatrizPDFPresentation = function () {
            const project = $stateParams.project;
            const lang = localStorage.lang;
            const prjpatt = new RegExp("^[a-zA-Z0-9_]+$");
            const langpatt = new RegExp("^en|es$");
            if (prjpatt.test(project) &&
                            langpatt.test(lang)) {
              // Tracking mixpanel
              mixPanelDashboard.trackReports("ExecutivePDFPresentation", userName, userEmail, org, projt);
              const url = `${BASE.url}pdf/${lang}/project/${project}/presentation/`;
              if (navigator.userAgent.indexOf("Firefox") === -1) {
                downLink = document.createElement("a");
                downLink.target = "_blank";
                downLink.href = url;
                downLink.click();
              }
              else {
                win = window.open(url, "__blank");
              }
            }
          };
          $scope.findingMatrizPDFReport = function () {
            const project = $stateParams.project;
            const lang = localStorage.lang;
            const prjpatt = new RegExp("^[a-zA-Z0-9_]+$");
            const langpatt = new RegExp("^en|es$");
            if (prjpatt.test(project) &&
                            langpatt.test(lang)) {
              // Tracking mixpanel
              mixPanelDashboard.trackReports("ExecutivePDFReport", userName, userEmail, org, projt);
              const url = `${BASE.url}pdf/${lang}/project/${project}/executive/`;
              if (navigator.userAgent.indexOf("Firefox") === -1) {
                downLink = document.createElement("a");
                downLink.target = "_blank";
                downLink.href = url;
                downLink.click();
              }
              else {
                win = window.open(url, "__blank");
              }
            }
          };
          $scope.closeModalAvance = function () {
            $uibModalInstance.close();
          };
          $scope.init();
        },
        "keyboard": false,
        "resolve": {"ok": true},
        "templateUrl": "executiveReportModal.html",
        "windowClass": "modal avance-modal"
      });
    };
    $scope.generatePDF = function () {
      const project = $scope.project;
      const lang = localStorage.lang;
      const prjpatt = new RegExp("^[a-zA-Z0-9_]+$");
      const langpatt = new RegExp("^en|es$");
      if (prjpatt.test(project) &&
                langpatt.test(lang)) {
        const url = `${BASE.url}doc/${lang}/project/${project}`;
        if (navigator.userAgent.indexOf("Firefox") === -1) {
          $scope.downloadURL = url;
        }
        else {
          win = window.open(url, "__blank");
        }
      }
    };
    $scope.downloadDoc = function () {
      if (typeof $scope.downloadURL === "undefined") {
        $timeout($scope.downloadDoc, 3000);
      }
      else {
        downLink = document.createElement("a");
        downLink.target = "_blank";
        downLink.href = $scope.downloadURL;
        downLink.click();
      }
    };
    $scope.mainGraphtypePieChart = function () {
      const currData = $scope.data;
      let total_seg = 0;
      let total_hig = 0;
      currData.forEach(function (val, cont) {
        const tipo = val.tipo_hallazgo;
        if (val.estado !== "Cerrado" && val.estado !== "Closed") {
          if (tipo === "Seguridad") {
            total_seg += 1;
          }
          else {
            total_hig += 1;
          }
        }
      });
      const seg_transl = $translate.instant("grapType.seg_label");
      const hig_transl = $translate.instant("grapType.hig_label");
      total_segLabel = seg_transl + " :n%".replace(":n", (total_seg * 100 / (total_seg + total_hig)).toFixed(2).toString());
      total_higLabel = hig_transl + " :n%".replace(":n", (total_hig * 100 / (total_seg + total_hig)).toFixed(2).toString());
      $("#grapType").empty();
      Morris.Donut({
        "data": [
          {
            "color": "#ff1a1a",
            "label": total_segLabel,
            "value": total_seg
          },
          {
            "color": "#31c0be",
            "label": total_higLabel,
            "value": total_hig
          }
        ],
        "element": "grapType",
        "resize": true
      });
    };
    $scope.mainGraphexploitPieChart = function () {
      const currData = $scope.data;
      let exploit = 0;
      let nonexploit = 0;
      currData.forEach(function (val, cont) {
        explotable = val.explotabilidad;
        if (val.estado !== "Cerrado" && val.estado !== "Closed") {
          if (explotable === "1.000 | Alta: No se requiere exploit o se puede automatizar" || explotable === "0.950 | Funcional: Existe exploit" || explotable === "1.000 | High: Exploit is not required or it can be automated" || explotable === "0.950 | Functional: There is an exploit") {
            exploit += 1;
          }
          else {
            nonexploit += 1;
          }
        }
      });
      const exploit_transl = $translate.instant("grapExploit.exploit_label");
      const nonexploit_transl = $translate.instant("grapExploit.nonexploit_label");
      exploitLabel = exploit_transl + " :n%".replace(":n", (exploit * 100 / (exploit + nonexploit)).toFixed(2).toString());
      nonexploitLabel = nonexploit_transl + " :n%".replace(":n", (nonexploit * 100 / (exploit + nonexploit)).toFixed(2).toString());
      $("#grapExploit").empty();
      Morris.Donut({
        "data": [
          {
            "color": "#ff1a1a",
            "label": exploitLabel,
            "value": exploit
          },
          {
            "color": "#31c0be",
            "label": nonexploitLabel,
            "value": nonexploit
          }
        ],
        "element": "grapExploit",
        "resize": true
      });
    };
    $scope.mainGraphstatusPieChart = function () {
      const currData = $scope.data;
      let total = 0;
      let open = 0;
      let partial = 0;
      let close = 0;
      currData.forEach(function (val, cont) {
        estado = val.estado;
        total += 1;
        if (estado === "Abierto" || estado === "Open") {
          open += 1;
        }
        else if (estado === "Cerrado" || estado === "Closed") {
          close += 1;
        }
        else {
          partial += 1;
        }
      });
      total = parseFloat(total);
      const open_transl = $translate.instant("grapStatus.open_label");
      const partial_transl = $translate.instant("grapStatus.partial_label");
      const close_transl = $translate.instant("grapStatus.close_label");
      openLabel = open_transl + " :n%".replace(":n", (open * 100 / total).toFixed(2).toString());
      partialLabel = partial_transl + " :n%".replace(":n", (partial * 100 / total).toFixed(2).toString());
      closeLabel = close_transl + " :n%".replace(":n", (close * 100 / total).toFixed(2).toString());
      $("#grapStatus").empty();
      Morris.Donut({
        "data": [
          {
            "color": "#ff1a1a",
            "label": openLabel,
            "value": open
          },
          {
            "color": "#ffbf00",
            "label": partialLabel,
            "value": partial
          },
          {
            "color": "#31c0be",
            "label": closeLabel,
            "value": close
          }
        ],
        "element": "grapStatus",
        "resize": true
      });
    };

    $scope.search = function () {
      let vlang = "en-US";
      if (localStorage.lang === "en") {
        vlang = "en-US";
      }
      else {
        vlang = "es-CO";
      }
      const project = $scope.project;
      const filter = $scope.filter;
      const finding = $scope.findingId;
      if (typeof project === "undefined" ||
                project === "") {
        const attention_at = $translate.instant("proj_alerts.attent_title");
        const attention_ac = $translate.instant("proj_alerts.attent_cont");
        $msg.warning(attention_ac, attention_at);
        return false;
      }
      if ($stateParams.project !== $scope.project) {
        $state.go("ProjectIndicators", {"project": $scope.project});
      }
      else if ($stateParams.project === $scope.project) {
        $scope.view.project = false;
        $scope.view.finding = false;

        /* Handling presentation button */
        const search_at = $translate.instant("proj_alerts.search_title");
        const search_ac = $translate.instant("proj_alerts.search_cont");
        $msg.info(search_ac, search_at);
        const reqProject = projectFtry.projectByName(project, filter);
        const reqEventualities = projectFtry.EventualityByName(project, "Name");
        reqProject.then(function (response) {
          $scope.view.project = true;
          if (!response.error) {
            // Tracking Mixpanel
            mixPanelDashboard.trackSearch("SearchFinding", userEmail, project);
            if (response.data.length === 0) {
              $scope.view.project = false;
              $scope.view.finding = false;
              $msg.error($translate.instant("proj_alerts.not_found"));
            }
            else {
              $scope.data = response.data;
              const org = Organization.toUpperCase();
              const projt = $stateParams.project.toUpperCase();
              $scope.alertHeader(org, projt);
              for (let cont = 0; cont < $scope.data.length; cont++) {
                switch ($scope.data[cont].actor) {
                case "​Cualquier persona en Internet":
                  $scope.data[cont].actor = $translate.instant("finding_formstack.actor.any_internet");
                  break;
                case "Cualquier cliente de la organización":
                  $scope.data[cont].actor = $translate.instant("finding_formstack.actor.any_costumer");
                  break;
                case "Solo algunos clientes de la organización":
                  $scope.data[cont].actor = $translate.instant("finding_formstack.actor.some_costumer");
                  break;
                case "Cualquier persona con acceso a la estación":
                  $scope.data[cont].actor = $translate.instant("finding_formstack.actor.any_access");
                  break;
                case "Cualquier empleado de la organización":
                  $scope.data[cont].actor = $translate.instant("finding_formstack.actor.any_employee");
                  break;
                case "Solo algunos empleados":
                  $scope.data[cont].actor = $translate.instant("finding_formstack.actor.some_employee");
                  break;
                case "Solo un empleado":
                  $scope.data[cont].actor = $translate.instant("finding_formstack.actor.one_employee");
                  break;
                default:
                  $scope.data[cont].actor = $translate.instant("finding_formstack.actor.default");
                }
                switch ($scope.data[cont].autenticacion) {
                case "0.704 | Ninguna: No se requiere autenticación":
                  $scope.data[cont].autenticacion = $translate.instant("finding_formstack.authentication.any_authen");
                  break;
                case "0.560 | Única: Único punto de autenticación":
                  $scope.data[cont].autenticacion = $translate.instant("finding_formstack.authentication.single_authen");
                  break;
                case "0.450 | Multiple: Multiples puntos de autenticación":
                  $scope.data[cont].autenticacion = $translate.instant("finding_formstack.authentication.multiple_authen");
                  break;
                default:
                  $scope.data[cont].autenticacion = $translate.instant("finding_formstack.authentication.default");
                }
                switch ($scope.data[cont].categoria) {
                case "Actualizar y configurar las líneas base de seguridad de los componentes":
                  $scope.data[cont].categoria = $translate.instant("finding_formstack.category.update_base");
                  break;
                case "Definir el modelo de autorización considerando el principio de mínimo privilegio":
                  $scope.data[cont].categoria = $translate.instant("finding_formstack.category.define_model");
                  break;
                case "Desempeño":
                  $scope.data[cont].categoria = $translate.instant("finding_formstack.category.performance");
                  break;
                case "Eventualidad":
                  $scope.data[cont].categoria = $translate.instant("finding_formstack.category.event");
                  break;
                case "Evitar exponer la información técnica de la aplicación, servidores y plataformas":
                  $scope.data[cont].categoria = $translate.instant("finding_formstack.category.avoid_technical");
                  break;
                case "Excluir datos sensibles del código fuente y del registro de eventos":
                  $scope.data[cont].categoria = $translate.instant("finding_formstack.category.exclude_data");
                  break;
                case "Fortalecer controles en autenticación y manejo de sesión":
                  $scope.data[cont].categoria = $translate.instant("finding_formstack.category.strengt_authen");
                  break;
                case "Fortalecer controles en el procesamiento de archivos":
                  $scope.data[cont].categoria = $translate.instant("finding_formstack.category.strengt_process");
                  break;
                case "Fortalecer la protección de datos almacenados relacionados con contraseñas o llaves criptográficas":
                  $scope.data[cont].categoria = $translate.instant("finding_formstack.category.strengt_protect");
                  break;
                case "Implementar controles para validar datos de entrada":
                  $scope.data[cont].categoria = $translate.instant("finding_formstack.category.validate_input");
                  break;
                case "Mantenibilidad":
                  $scope.data[cont].categoria = $translate.instant("finding_formstack.category.maintain");
                  break;
                case "Registrar eventos para trazabilidad y auditoría":
                  $scope.data[cont].categoria = $translate.instant("finding_formstack.category.record_event");
                  break;
                case "Utilizar protocolos de comunicación seguros":
                  $scope.data[cont].categoria = $translate.instant("finding_formstack.category.secure_protoc");
                  break;
                case "Validar la integridad de las transacciones en peticiones HTTP":
                  $scope.data[cont].categoria = $translate.instant("finding_formstack.category.validate_http");
                  break;
                default:
                  $scope.data[cont].categoria = $translate.instant("finding_formstack.category.default");
                }
                switch ($scope.data[cont].complejidad_acceso) {
                case "0.350 | Alto: Se requieren condiciones especiales como acceso administrativo":
                  $scope.data[cont].complejidad_acceso = $translate.instant("finding_formstack.complexity.high_complex");
                  break;
                case "0.610 | Medio: Se requieren algunas condiciones como acceso al sistema":
                  $scope.data[cont].complejidad_acceso = $translate.instant("finding_formstack.complexity.medium_complex");
                  break;
                case "0.710 | Bajo: No se requiere ninguna condición especial":
                  $scope.data[cont].complejidad_acceso = $translate.instant("finding_formstack.complexity.low_complex");
                  break;
                default:
                  $scope.data[cont].complejidad_acceso = $translate.instant("finding_formstack.complexity.default");
                }
                switch ($scope.data[cont].escenario) {
                case "Anónimo desde Internet":
                  $scope.data[cont].escenario = $translate.instant("finding_formstack.scenario.anon_inter");
                  break;
                case "Anónimo desde Intranet":
                  $scope.data[cont].escenario = $translate.instant("finding_formstack.scenario.anon_intra");
                  break;
                case "Escaneo de Infraestructura":
                  $scope.data[cont].escenario = $translate.instant("finding_formstack.scenario.infra_scan");
                  break;
                case "Extranet usuario no autorizado":
                  $scope.data[cont].escenario = $translate.instant("finding_formstack.scenario.unauth_extra");
                  break;
                case "Internet usuario autorizado":
                  $scope.data[cont].escenario = $translate.instant("finding_formstack.scenario.auth_inter");
                  break;
                case "Internet usuario no autorizado":
                  $scope.data[cont].escenario = $translate.instant("finding_formstack.scenario.unauth_inter");
                  break;
                case "Intranet usuario autorizado":
                  $scope.data[cont].escenario = $translate.instant("finding_formstack.scenario.auth_intra");
                  break;
                case "Intranet usuario no autorizado":
                  $scope.data[cont].escenario = $translate.instant("finding_formstack.scenario.unauth_inter");
                  break;
                default:
                  $scope.data[cont].escenario = $translate.instant("finding_formstack.scenario.default");
                }
                switch ($scope.data[cont].estado) {
                case "Abierto":
                  $scope.data[cont].estado = $translate.instant("finding_formstack.status.open");
                  break;
                case "Cerrado":
                  $scope.data[cont].estado = $translate.instant("finding_formstack.status.close");
                  break;
                case "Parcialmente cerrado":
                  $scope.data[cont].estado = $translate.instant("finding_formstack.status.part_close");
                  break;
                default:
                  $scope.data[cont].estado = $translate.instant("finding_formstack.status.default");
                }
                switch ($scope.data[cont].explotabilidad) {
                case "0.850 | Improbable: No existe un exploit":
                  $scope.data[cont].explotabilidad = $translate.instant("finding_formstack.exploitability.improbable");
                  break;
                case "0.900 | Conceptual: Existen pruebas de laboratorio":
                  $scope.data[cont].explotabilidad = $translate.instant("finding_formstack.exploitability.conceptual");
                  break;
                case "0.950 | Funcional: Existe exploit":
                  $scope.data[cont].explotabilidad = $translate.instant("finding_formstack.exploitability.functional");
                  break;
                case "1.000 | Alta: No se requiere exploit o se puede automatizar":
                  $scope.data[cont].explotabilidad = $translate.instant("finding_formstack.exploitability.high");
                  break;
                default:
                  $scope.data[cont].explotabilidad = $translate.instant("finding_formstack.exploitability.default");
                }
                switch ($scope.data[cont].explotable) {
                case "Si":
                  $scope.data[cont].explotable = $translate.instant("finding_formstack.exploitable.yes");
                  break;
                case "No":
                  $scope.data[cont].explotable = $translate.instant("finding_formstack.exploitable.no");
                  break;
                default:
                  $scope.data[cont].explotable = $translate.instant("finding_formstack.exploitable.default");
                }
                switch ($scope.data[cont].impacto_confidencialidad) {
                case "0 | Ninguno: No se presenta ningún impacto":
                  $scope.data[cont].impacto_confidencialidad = $translate.instant("finding_formstack.confidenciality.none");
                  break;
                case "0.275 | Parcial: Se obtiene acceso a la información pero no control sobre ella":
                  $scope.data[cont].impacto_confidencialidad = $translate.instant("finding_formstack.confidenciality.partial");
                  break;
                case "0.660 | Completo: Se controla toda la información relacionada con el objetivo":
                  $scope.data[cont].impacto_confidencialidad = $translate.instant("finding_formstack.confidenciality.complete");
                  break;
                default:
                  $scope.data[cont].impacto_confidencialidad = $translate.instant("finding_formstack.confidenciality.default");
                }
                switch ($scope.data[cont].impacto_disponibilidad) {
                case "0 | Ninguno: No se presenta ningún impacto":
                  $scope.data[cont].impacto_disponibilidad = $translate.instant("finding_formstack.availability.none");
                  break;
                case "0.275 | Parcial: Se presenta intermitencia en el acceso al objetivo":
                  $scope.data[cont].impacto_disponibilidad = $translate.instant("finding_formstack.availability.partial");
                  break;
                case "0.660 | Completo: Hay una caída total del objetivo":
                  $scope.data[cont].impacto_disponibilidad = $translate.instant("finding_formstack.availability.complete");
                  break;
                default:
                  $scope.data[cont].impacto_disponibilidad = $translate.instant("finding_formstack.availability.default");
                }
                switch ($scope.data[cont].impacto_integridad) {
                case "0 | Ninguno: No se presenta ningún impacto":
                  $scope.data[cont].impacto_integridad = $translate.instant("finding_formstack.integrity.none");
                  break;
                case "0.275 | Parcial: Es posible modificar cierta información del objetivo":
                  $scope.data[cont].impacto_integridad = $translate.instant("finding_formstack.integrity.partial");
                  break;
                case "0.660 | Completo: Es posible modificar toda la información del objetivo":
                  $scope.data[cont].impacto_integridad = $translate.instant("finding_formstack.integrity.complete");
                  break;
                default:
                  $scope.data[cont].impacto_integridad = $translate.instant("finding_formstack.integrity.default");
                }
                switch ($scope.data[cont].nivel_confianza) {
                case "0.900 | No confirmado: Existen pocas fuentes que reconocen la vulnerabilidad":
                  $scope.data[cont].nivel_confianza = $translate.instant("finding_formstack.confidence.not_confirm");
                  break;
                case "0.950 | No corroborado: La vulnerabilidad es reconocida por fuentes no oficiales":
                  $scope.data[cont].nivel_confianza = $translate.instant("finding_formstack.confidence.not_corrob");
                  break;
                case "1.000 | Confirmado: La vulnerabilidad es reconocida por el fabricante":
                  $scope.data[cont].nivel_confianza = $translate.instant("finding_formstack.confidence.confirmed");
                  break;
                default:
                  $scope.data[cont].nivel_confianza = $translate.instant("finding_formstack.confidence.default");
                }
                switch ($scope.data[cont].nivel_resolucion) {
                case "0.950 | Paliativa: Existe un parche que no fue publicado por el fabricante":
                  $scope.data[cont].nivel_resolucion = $translate.instant("finding_formstack.resolution.palliative");
                  break;
                case "0.870 | Oficial: Existe un parche disponible por el fabricante":
                  $scope.data[cont].nivel_resolucion = $translate.instant("finding_formstack.resolution.official");
                  break;
                case "0.900 | Temporal: Existen soluciones temporales":
                  $scope.data[cont].nivel_resolucion = $translate.instant("finding_formstack.resolution.temporal");
                  break;
                case "1.000 | Inexistente: No existe solución":
                  $scope.data[cont].nivel_resolucion = $translate.instant("finding_formstack.resolution.non_existent");
                  break;
                default:
                  $scope.data[cont].nivel_resolucion = $translate.instant("finding_formstack.resolution.default");
                }
                switch ($scope.data[cont].probabilidad) {
                case "100% Vulnerado Anteriormente":
                  $scope.data[cont].probabilidad = $translate.instant("finding_formstack.probability.prev_vuln");
                  break;
                case "75% Fácil de vulnerar":
                  $scope.data[cont].probabilidad = $translate.instant("finding_formstack.probability.easy_vuln");
                  break;
                case "50% Posible de vulnerar":
                  $scope.data[cont].probabilidad = $translate.instant("finding_formstack.probability.possible_vuln");
                  break;
                case "25% Difícil de vulnerar":
                  $scope.data[cont].probabilidad = $translate.instant("finding_formstack.probability.diffic_vuln");
                  break;
                default:
                  $scope.data[cont].probabilidad = $translate.instant("finding_formstack.probability.default");
                }
                switch ($scope.data[cont].tipo_hallazgo_cliente) {
                case "Higiene":
                  $scope.data[cont].tipo_hallazgo_cliente = $translate.instant("finding_formstack.finding_type.hygiene");
                  break;
                case "Vulnerabilidad":
                  $scope.data[cont].tipo_hallazgo_cliente = $translate.instant("finding_formstack.finding_type.vuln");
                  break;
                default:
                  $scope.data[cont].tipo_hallazgo_cliente = $translate.instant("finding_formstack.finding_type.default");
                }
                switch ($scope.data[cont].tipo_prueba) {
                case "Análisis":
                  $scope.data[cont].tipo_prueba = $translate.instant("finding_formstack.test_method.analysis");
                  break;
                case "Aplicación":
                  $scope.data[cont].tipo_prueba = $translate.instant("finding_formstack.test_method.app");
                  break;
                case "Binario":
                  $scope.data[cont].tipo_prueba = $translate.instant("finding_formstack.test_method.binary");
                  break;
                case "Código":
                  $scope.data[cont].tipo_prueba = $translate.instant("finding_formstack.test_method.code");
                  break;
                case "Infraestructura":
                  $scope.data[cont].tipo_prueba = $translate.instant("finding_formstack.test_method.infras");
                  break;
                default:
                  $scope.data[cont].tipo_prueba = $translate.instant("finding_formstack.test_method.default");
                }
                switch ($scope.data[cont].vector_acceso) {
                case "0.646 | Red adyacente: Explotable desde el mismo segmento de red":
                  $scope.data[cont].vector_acceso = $translate.instant("finding_formstack.access_vector.adjacent");
                  break;
                case "1.000 | Red: Explotable desde Internet":
                  $scope.data[cont].vector_acceso = $translate.instant("finding_formstack.access_vector.network");
                  break;
                case "0.395 | Local: Explotable con acceso local al objetivo":
                  $scope.data[cont].vector_acceso = $translate.instant("finding_formstack.access_vector.local");
                  break;
                default:
                  $scope.data[cont].vector_acceso = $translate.instant("finding_formstack.access_vector.default");
                }
                switch ($scope.data[cont].tratamiento) {
                case "Asumido":
                  $scope.data[cont].tratamiento = $translate.instant("finding_formstack.treatment_header.asummed");
                  break;
                case "Pendiente":
                  $scope.data[cont].tratamiento = $translate.instant("finding_formstack.treatment_header.working");
                  break;
                case "Remediar":
                  $scope.data[cont].tratamiento = $translate.instant("finding_formstack.treatment_header.remediated");
                  break;
                default:
                  $scope.data[cont].tratamiento = $translate.instant("finding_formstack.treatment_header.default");
                }
              }
              $scope.calculateCardinality({"data": $scope.data});
              $timeout($scope.mainGraphexploitPieChart, 200);
              $timeout($scope.mainGraphtypePieChart, 200);
              $timeout($scope.mainGraphstatusPieChart, 200);
              // CONFIGURACION DE TABLA
              $("#vulnerabilities").bootstrapTable("destroy");
              $("#vulnerabilities").bootstrapTable({
                "cookie": true,
                "cookieIdTable": "saveId",
                "data": $scope.data,
                "exportDataType": "all",
                "locale": vlang,
                "onClickRow" (row, elem) {
                  $state.go("FindingDescription", {
                    "id": row.id,
                    "project": row.proyecto_fluid.toLowerCase()
                  });
                  $("#infoItem").addClass("active");
                  $("#info").addClass("active");
                  $("#cssv2Item").removeClass("active");
                  $("#cssv2").removeClass("active");
                  $("#trackingItem").removeClass("active");
                  $("#tracking").removeClass("active");
                  $("#evidenceItem").removeClass("active");
                  $("#evidence").removeClass("active");
                  $("#exploitItem").removeClass("active");
                  $("#exploit").removeClass("active");
                  // Tracking mixpanel
                  mixPanelDashboard.trackFinding("ReadFinding", userEmail, row.id);
                  $scope.currentScrollPosition = $(document).scrollTop();
                }
              });
              $("#vulnerabilities").bootstrapTable("refresh");
              // MANEJO DEL UI
              $("#search_section").show();
              $("[data-toggle=\"tooltip\"]").tooltip();

              if (typeof $stateParams.finding !== "undefined") {
                $scope.finding.id = $stateParams.finding;
                $scope.view.project = false;
                $scope.view.finding = false;
              }
            }
          }
          else if (response.error) {
            $scope.view.project = false;
            $scope.view.finding = false;
            if (response.message === "Access denied") {
              Rollbar.warning("Warning: Access to project denied");
              $msg.error($translate.instant("proj_alerts.access_denied"));
            }
            else if (response.message === "Project masked") {
              Rollbar.warning("Warning: Project deleted");
              $msg.error($translate.instant("proj_alerts.project_deleted"));
            }
            else {
              Rollbar.warning("Warning: Project not found");
              $msg.error($translate.instant("proj_alerts.not_found"));
            }
          }
        });
        reqEventualities.then(function (response) {
          if (!response.error) {
            for (let cont = 0; cont < response.data.length; cont++) {
              switch (response.data[cont].tipo) {
              case "Autorización para ataque especial":
                response.data[cont].tipo = $translate.instant("event_formstack.type.auth_attack");
                break;
              case "Alcance difiere a lo aprobado":
                response.data[cont].tipo = $translate.instant("event_formstack.type.toe_differs");
                break;
              case "Aprobación de alta disponibilidad":
                response.data[cont].tipo = $translate.instant("event_formstack.type.high_approval");
                break;
              case "Insumos incorrectos o faltantes":
                response.data[cont].tipo = $translate.instant("event_formstack.type.incor_supplies");
                break;
              case "Cliente suspende explicitamente":
                response.data[cont].tipo = $translate.instant("event_formstack.type.explic_suspend");
                break;
              case "Cliente aprueba cambio de alcance":
                response.data[cont].tipo = $translate.instant("event_formstack.type.approv_change");
                break;
              case "Cliente cancela el proyecto/hito":
                response.data[cont].tipo = $translate.instant("event_formstack.type.cancel_proj");
                break;
              case "Cliente detecta ataque":
                response.data[cont].tipo = $translate.instant("event_formstack.type.det_attack");
                break;
              case "Otro":
                response.data[cont].tipo = $translate.instant("event_formstack.type.other");
                break;
              case "Ambiente no accesible":
                response.data[cont].tipo = $translate.instant("event_formstack.type.inacc_ambient");
                break;
              case "Ambiente inestable":
                response.data[cont].tipo = $translate.instant("event_formstack.type.uns_ambient");
                break;
              default:
                response.data[cont].tipo = $translate.instant("event_formstack.type.unknown");
              }
              switch (response.data[cont].estado) {
              case "Pendiente":
                response.data[cont].estado = $translate.instant("event_formstack.status.unsolve");
                break;
              case "Tratada":
                response.data[cont].estado = $translate.instant("event_formstack.status.solve");
                break;
              default:
                response.data[cont].estado = $translate.instant("event_formstack.status.unknown");
              }
            }
            mixPanelDashboard.trackSearch("SearchEventuality", userEmail, project);
            // CONFIGURACION DE TABLA
            $("#tblEventualities").bootstrapTable("destroy");
            $("#tblEventualities").bootstrapTable({
              "data": response.data,
              "locale": vlang,
              "onClickRow" (row) {
                const modalInstance = $uibModal.open({
                  "animation": true,
                  "backdrop": "static",
                  "controller" ($scope, $uibModalInstance, evt) {
                    $scope.evt = evt;
                    // Tracking mixpanel
                    const org = Organization.toUpperCase();
                    const projt = project.toUpperCase();
                    mixPanelDashboard.trackReadEventuality(userName, userEmail, org, projt, evt.id);
                    $scope.close = function () {
                      $uibModalInstance.close();
                    };
                  },
                  "resolve": {"evt": row},
                  "templateUrl": `${BASE.url}assets/views/project/eventualityMdl.html`
                });
              }
            });
            $("#tblEventualities").bootstrapTable("refresh");
            // MANEJO DEL UI
            $("#search_section").show();
            $("[data-toggle=\"tooltip\"]").tooltip();
          }
          else if (response.message === "Access to project denied") {
            Rollbar.warning("Warning: Access to event denied");
            $msg.error($translate.instant("proj_alerts.access_denied"));
          }
          else {
            Rollbar.warning("Warning: Event not found");
            $msg.error($translate.instant("proj_alerts.not_found"));
          }
        });
      }
    };
    $scope.openModalAvance = function () {
      const modalInstance = $uibModal.open({
        "animation": true,
        "controller" ($scope, $uibModalInstance) {
          const auxiliar = $("#vulnerabilities").bootstrapTable("getData");
          const data = auxiliar;
          for (let cont = 0; cont < data.length; cont++) {
            data[cont].atributos = 0;
            data[cont].link = `${window.location.href.split("project/")[0]}project/${data[cont].proyecto_fluid.toLowerCase()}/${data[cont].id}/description`;
            if (typeof data[cont].registros !== "undefined" && data[cont].registros !== "") {
              data[cont].atributos = 1 + (data[cont].registros.match(/\n/g) || []).length;
            }
          }
          for (let cont = 0; cont < data.length - 1; cont++) {
            for (j = cont + 1; j < data.length; j++) {
              if (parseFloat(data[cont].criticidad) < parseFloat(data[j].criticidad)) {
                aux = data[cont];
                data[cont] = data[j];
                data[j] = aux;
              }
            }
          }
          $scope.rows = data;
          $scope.closeModalAvance = function () {
            $uibModalInstance.close();
            $timeout(function () {
              $("#vulnerabilities").bootstrapTable("load", auxiliar);
            }, 100);
          };
        },
        "keyboard": false,
        "resolve": {"ok": true},
        "templateUrl": "avance.html",
        "windowClass": "modal avance-modal"
      });
    };
    $scope.showProjectView = function () {
      $("#findingView").fadeOut(300);
      $("#projectView").fadeIn(300);
      $(".loader").hide();
    };
    $scope.showFindingView = function () {
      $("#projectView").fadeOut(300);
      $("#findingView").fadeIn(300);
      $(".loader").hide();
    };
    $scope.urlIndicators = function () {
      location.replace(`${window.location.href.split($stateParams.project)[0] + $stateParams.project}/indicators`);
    };
    $scope.urlFindings = function () {
      location.replace(`${window.location.href.split($stateParams.project)[0] + $stateParams.project}/findings`);
    };
    $scope.urlEvents = function () {
      location.replace(`${window.location.href.split($stateParams.project)[0] + $stateParams.project}/events`);
    };
    $scope.init();
  }
);
