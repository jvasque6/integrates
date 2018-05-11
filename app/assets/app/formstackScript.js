/* eslint no-magic-numbers: ["error", { "ignore": [-1,0,1] }]*/
/* global document, $, alertify, timew, angular,
Tabletop, v:true, obj:true, $msg, remember:true
*/
angular.element(document).ready(() => {
  const remember = function remember () {
    try {
      alertify.log("<div class=\"\" style=\"padding: 8px;\"> <p class=" +
                   "\"text-center\">Recordatorio</p><p class=\"text-left\"> " +
                   "Recuerda personalizar los campos dependiendo de la" +
                   " situación que vas a reportar!</p> </div>");
      return true;
    }
    catch (err) {
      return false;
    }
  };
  remember();
  const timew = 35000;
  const REPORT_CONTEXT = 5;
  setInterval(() => {
    remember();
  }, timew);
  document.getElementsByTagName("select")[REPORT_CONTEXT].onchange = function
  onchange () {
    const verf = document.getElementsByTagName("select")[REPORT_CONTEXT].value;
    if (verf === "Verificación") {
      alertify.success("<p class=\"text-center\"> " +
                                  "Información: </p> <p class=\"text-left\">" +
                                  "Verificacion debe usarse para reportar " +
                                  "hallazgos en chequeos cruzados </p>");
    }
  };
});

/**
 * @function isUpperCase
 * @param {string} str Input string
 * @return {boolean} Boolean if input string is in upper case
 */
const isUpperCase = function isUpperCase (str) {
  return str === str.toUpperCase();
};

String.prototype.capitalizeFirstLetter = function capitalizeFirstLetter () {
  /* eslint no-extend-native: ["error", { "exceptions": ["String"] }]*/
  return this.charAt(0).toUpperCase() + this.slice(1);
};

const description = angular.element("#field32202728");
const requirement = angular.element("#field38254586");
const solution = angular.element("#field38619077");
const threat = angular.element("#field38193361");
const risk = angular.element("#field38193362");
const donde = angular.element("#field38193357");
const hasSolution = angular.element("#field38861717_1");
const hasNoSolution = angular.element("#field38861717_2");
const solutionKb = angular.element("#field38861739");
const tipo = angular.element("#field54319180");
const debilidad = angular.element("#field38899046");
const solutionPdf = angular.element("#field38307753");
const evidenciaHallazgo = angular.element("#field32202896");
const exploit = angular.element("#field38307199");
const evidenciaExplotacion = angular.element("#field38307222");
const animacion = angular.element("#field38307272");
const siEvidente = angular.element("#field49132420_1");
const noEvidente = angular.element("#field49132420_2");
const publicSpreadsheetUrl = "https://docs.google.com/spreadsheets/d/1L37WnF" +
                             "6enoC8Ws8vs9sr0G29qBLwbe-3ztbuopu1nvc/pubhtml";

/**
 * @function showInfo
 * @param {Object} data Data entered by an analist
 * @return {undefined} Info about findings
 */
const showInfo = function showInfo (data) {
  const obj = $.parseJSON(JSON.stringify(data));
  angular.element("#field32201810").change(() => {
    const title = angular.element("#field32201810").val();
    const REPORT_CONTEXT = 5;
    for (let cont = 0; cont < obj.length; cont++) {
      if (obj[cont].Titulo === title) {
        description.val(obj[cont].Descripcion);
        requirement.val(obj[cont].Requisito);
        solution.val(obj[cont].Recomendacion);
        donde.attr("placeholder", obj[cont].Donde);
        debilidad.val(obj[cont].CWE.split("/")[REPORT_CONTEXT].split(".")[0]);
        tipo.val(obj[cont].Tipo);
        if (obj[cont].Evidente === "Sí") {
          siEvidente.attr("checked", true);
        }
        else {
          noEvidente.attr("checked", true);
        }
        if (obj[cont].Solucion_KB !== "-") {
          hasSolution.attr("checked", true);
          angular.element("#fsCell38861739").removeClass("fsHidden");
          angular.element("#fsCell38307753").removeClass("fsHidden");
          solutionPdf.removeAttr("disabled");
          solutionKb.val(obj[cont].Solucion_KB);
        }
        else if (obj[cont].Solucion_KB === "-") {
          hasNoSolution.attr("checked", true);
          angular.element("#fsCell38861739").addClass("fsHidden");
          angular.element("#fsCell38307753").addClass("fsHidden");
          solutionPdf.attr("disabled");
        }

        if (angular.element("#field38392454").val() === "Detallado") {
          threat.val(obj[cont].Amenaza);
          risk.val(obj[cont].Riesgo);
        }
        const HAS_FUNCTIONAL_EXPLOIT = 0.950;
        // If(obj[cont].Exploit === "Sí"){
        if (angular.element("#field38529253").val() ===
                                                      HAS_FUNCTIONAL_EXPLOIT) {
          exploit.prop("required", true);
          exploit.addClass("fsRequired");
          exploit.attr("aria-required", true);
          exploit.attr("fsRequired");
          evidenciaExplotacion.prop("required", true);
          evidenciaExplotacion.addClass("fsRequired");
          evidenciaExplotacion.attr("aria-required", true);
          evidenciaExplotacion.attr("fsRequired");
        }
        else {
          exploit.prop("required", false);
          exploit.removeClass("fsRequired");
          exploit.attr("aria-required", false);
          evidenciaExplotacion.prop("required", false);
          evidenciaExplotacion.removeClass("fsRequired");
          evidenciaExplotacion.attr("aria-required", false);
          animacion.prop("required", false);
          animacion.removeClass("fsRequired");
          animacion.attr("aria-required", false);
        }
        break;
      }
      if (cont === obj.length - 1) {
        description.val("");
        requirement.val("");
        solution.val("");
        threat.val("");
        risk.val("");
        tipo.val("");
        debilidad.val(0);
        donde.attr("placeholder", "Formato DONDE dependiendo " +
                   "de la vulnerabilidad.");
        angular.element("#fsCell38861739").addClass("fsHidden");
        angular.element("#fsCell38307753").addClass("fsHidden");
        angular.element("#field38307753").attr("disabled");
      }
    }
  });
};

Tabletop.init({
  "callback": showInfo,
  "key": publicSpreadsheetUrl,
  "prettyColumnNames": true,
  "simpleSheet": true
});
const FILE_NAME_INDEX = 2;
angular.element(donde).focusout(() => {
  donde.val($.trim(donde.val()));
});

angular.element(requirement).focusout(() => {
  requirement.val($.trim(requirement.val()));
  if (requirement.val()[requirement.val().length - 1] !== ".") {
    requirement.val(`${requirement.val()}.`);
  }
  if (isUpperCase(requirement.val()[0]) === false) {
    requirement.val(requirement.val().capitalizeFirstLetter());
  }
});

angular.element(description).focusout(() => {
  description.val($.trim(description.val()));
  if (description.val()[description.val().length - 1] !== ".") {
    description.val(`${description.val()}.`);
  }
  if (isUpperCase(description.val()[0]) === false) {
    description.val(description.val().capitalizeFirstLetter());
  }
  description.val(description.val());
});

angular.element(solution).focusout(() => {
  solution.val($.trim(solution.val()));
  if (solution.val()[solution.val().length - 1] !== ".") {
    solution.val(`${solution.val()}.`);
  }
  if (isUpperCase(solution.val()[0]) === false) {
    solution.val(solution.val().capitalizeFirstLetter());
  }
});

angular.element(risk).focusout(() => {
  risk.val($.trim(risk.val()));
  if (risk.val()[risk.val().length - 1] !== ".") {
    risk.val(`${risk.val()}.`);
  }
  if (isUpperCase(risk.val()[0]) === false) {
    risk.val(risk.val().capitalizeFirstLetter());
  }
});

angular.element(threat).focusout(() => {
  threat.val($.trim(threat.val()));
  if (threat.val()[threat.val().length - 1] !== ".") {
    threat.val(`${threat.val()}.`);
  }
  if (isUpperCase(threat.val()[0]) === false) {
    threat.val(threat.val().capitalizeFirstLetter());
  }
});

angular.element(evidenciaHallazgo).change(() => {
  const hallazgoUpload = angular.element(evidenciaHallazgo).val().
    split("\\")[FILE_NAME_INDEX].split(".")[0];
  const substring = "evidencia";
  if (hallazgoUpload.indexOf(substring) === -1) {
    $msg.error("El archivo se debe contener la palabra evidencia");
    evidenciaHallazgo.val("");
  }
});

angular.element(exploit).change(() => {
  const exploitUpload = angular.element(exploit).val().
    split("\\")[FILE_NAME_INDEX].split(".")[0];
  if (exploitUpload !== "exploit") {
    $msg.error("El archivo se debe llamar: exploit");
    exploit.val("");
  }
  else if (exploitUpload === "exploit") {
    exploit.attr("aria-invalid", false);
  }
});

angular.element(evidenciaExplotacion).change(() => {
  const explotacionUpload = angular.element(evidenciaExplotacion).val().
    split("\\")[FILE_NAME_INDEX].split(".")[0];
  if (explotacionUpload !== "evidencia-de-explotacion") {
    $msg.error("El archivo se debe llamar: evidencia-de-explotacion");
    evidenciaExplotacion.val("");
  }
  else if (explotacionUpload === "evidencia-de-explotacion") {
    evidenciaExplotacion.attr("aria-invalid", false);
  }
});

angular.element(animacion).change(() => {
  const animacionUpload = angular.element(animacion).val().
    split("\\")[FILE_NAME_INDEX].split(".")[0];
  if (animacionUpload !== "animacion-de-explotacion") {
    $msg.error("El archivo se debe llamar: animacion-de-explotacion");
    animacion.val("");
  }
  else if (animacionUpload === "animacion-de-explotacion") {
    animacion.attr("aria-invalid", false);
  }
});

angular.element(solutionPdf).change(() => {
  const solUpload = angular.element(solutionPdf).val().
    split("\\")[FILE_NAME_INDEX].split(".")[0];
  if (solUpload !== "solucion") {
    $msg.error("El archivo se debe llamar: solucion");
    solutionPdf.val("");
  }
});
