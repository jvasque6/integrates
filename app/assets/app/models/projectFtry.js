/* eslint no-magic-numbers: ["error", { "ignore": [500, 401] }]*/
/* global integrates, BASE, $xhr, window.location:true, $, Rollbar */
/**
 * @file projectFtry.js
 * @author engineering@fluidattacks.com
 */
/**
 * Crea el factory de la funcionalidad de hallazgos
 * @name projectFtry
 * @param {Object} $q
 * @return {undefined}
 */
/** @export */
integrates.factory("projectFtry", function projectFtry ($q, $translate) {
  return {

    /**
     * Invoca el servicio para actualizar la seccion
     * descriptiva de un hallazgo
     * @function DeleteFinding
     * @param {JSON} data
     * @member integrates.projectFtry
     * @return {Object}
     */
    "DeleteFinding" (data) {
      const oopsAc = $translate.instant("proj_alerts.error_text");
      return $xhr.post($q, `${BASE.url}delete_finding`, {
        "_": Math.random(),
        data
      }, oopsAc);
    },

    /**
     * Invoca el servicio para tener las eventualidades de un proyecto
     * @function EventualityByName
     * @param {String} project
     * @param {String} category
     * @member integrates.projectFtry
     * @return {Object}
     */
    "EventualityByName" (project, category) {
      const oopsAc = $translate.instant("proj_alerts.error_text");
      return $xhr.get($q, `${BASE.url}get_eventualities`, {
        "_": Math.random(),
        category,
        project
      }, oopsAc);
    },

    /**
     * Invoca el servicio para tener el detalle de un hallazgo
     * @function FindingById
     * @param {Integer} id
     * @member integrates.projectFtry
     * @return {Object}
     */
    "FindingById" (id) {
      const oopsAc = $translate.instant("proj_alerts.error_text");
      return $xhr.post($q, `${BASE.url}get_finding`, {
        "_": Math.random(),
        id
      }, oopsAc);
    },

    /**
     * @function FindingSolved
     * @param {JSON} data
     * @member integrates.projectFtry
     * @return {Object}s
     */
    "FindingSolved" (data) {
      const oopsAc = $translate.instant("proj_alerts.error_text");
      return $xhr.post($q, `${BASE.url}finding_solved`, {
        "_": Math.random(),
        data
      }, oopsAc);
    },

    /**
     * Invoca el servicio para mostrar si fue verificado un hallazgo
     * @function FindingVerified
     * @param {JSON} data
     * @member integrates.projectFtry
     * @return {Object}s
     */
    "FindingVerified" (data) {
      const oopsAc = $translate.instant("proj_alerts.error_text");
      return $xhr.post($q, `${BASE.url}finding_verified`, {
        "_": Math.random(),
        data
      }, oopsAc);
    },

    /**
     * Invoca el servicio para tener el detalle de un hallazgo
     * @function ProjectDoc
     * @param {String} project
     * @param {JSON} json
     * @param {String} format
     * @member integrates.projectFtry
     * @return {Object}
     */
    "ProjectDoc" (project, json, format) {
      const oopsAc = $translate.instant("proj_alerts.error_text");
      return $xhr.post($q, `${BASE.url}generate_autodoc`, {
        "_": Math.random(),
        "data": json,
        format,
        project
      }, oopsAc);
    },


    /**
     * Invoca el servicio para mostrar si fue remediado un hallazgo
     * @function RemediatedView
     * @param {JSON} data
     * @member integrates.projectFtry
     * @return {Object}s
     */
    "RemediatedView" (id) {
      const oopsAc = $translate.instant("proj_alerts.error_text");
      return $xhr.get($q, `${BASE.url}get_remediated`, {
        "_": Math.random(),
        id
      }, oopsAc);
    },

    /**
     * Invoca el servicio para mostrar la severidad total del proyecto
     * @function RemediatedView
     * @param {String} project
     * @member integrates.projectFtry
     * @return {Object}s
     */
    "TotalSeverity" (project) {
      const oopsAc = $translate.instant("proj_alerts.error_text");
      return $xhr.get($q, `${BASE.url}total_severity`, {
        "_": Math.random(),
        project
      }, oopsAc);
    },

    /**
     * Invoca el servicio para actualizar la seccion
     * cssv2 de un hallazgo
     * @function UpdateCSSv2
     * @param {JSON} data
     * @member integrates.projectFtry
     * @return {Object}
     */
    "UpdateCSSv2" (data) {
      const oopsAc = $translate.instant("proj_alerts.error_text");
      return $xhr.post($q, `${BASE.url}update_cssv2`, {
        "_": Math.random(),
        data
      }, oopsAc);
    },

    /**
     * Invoca el servicio para actualizar la seccion
     * descriptiva de un hallazgo
     * @function UpdateDescription
     * @param {JSON} data
     * @member integrates.projectFtry
     * @return {Object}
     */
    "UpdateDescription" (data) {
      const oopsAc = $translate.instant("proj_alerts.error_text");
      return $xhr.post($q, `${BASE.url}update_description`, {
        "_": Math.random(),
        data
      }, oopsAc);
    },

    "UpdateEvidenceFiles" (data, callbackFn, errorFn) {
      try {
        $.ajax({
          "cache": false,
          "contentType": false,
          data,
          "error" (xhr, status, response) {
            $(".loader").hide();
            if (xhr.status == 500) {
              Rollbar.error("Error: An error ocurred loading data");
            }
            else if (xhr.status == 401) {
              Rollbar.error("Error: 401 Unauthorized");
              window.location = "error401";
            }
            errorFn(JSON.parse(response));
          },
          "method": "POST",
          "mimeType": "multipart/form-data",
          "processData": false,
          "success" (response) {
            $(".loader").hide();
            callbackFn(JSON.parse(response));
          },
          "url": `${BASE.url}update_evidences_files?_${Math.random()}`
        });
      }
      catch (err) {
        if (err.status == 401) {
          Rollbar.error("Error: 401 Unauthorized");
          window.location = "error401";
        }
        Rollbar.error("Error: An error ocurred getting finding by ID", err);
      }
    },

    "UpdateEvidenceText" (data) {
      const oopsAc = $translate.instant("proj_alerts.error_text");
      return $xhr.post($q, `${BASE.url}update_evidence_text`, {
        "_": Math.random(),
        data
      }, oopsAc);
    },

    /**
     * Invoca el servicio para actualizar el tratamiento de un hallazgo
     * @function UpdateTreatment
     * @param {JSON} data
     * @member integrates.projectFtry
     * @return {Object}
     */
    "UpdateTreatment" (data) {
      const oopsAc = $translate.instant("proj_alerts.error_text");
      return $xhr.post($q, `${BASE.url}update_treatment`, {
        "_": Math.random(),
        data
      }, oopsAc);
    },

    /**
     * Invoca el servicio para agregar nuevos comentarios en un hallazgo
     * @function addComment
     * @param {String} id
     * @param {Object} data
     * @member integrates.projectFtry
     * @return {Object}
     */
    "addComment" (id, data) {
      const oopsAc = $translate.instant("proj_alerts.error_text");
      return $xhr.post($q, `${BASE.url}add_comment`, {
        "_": Math.random(),
        data,
        id
      }, oopsAc);
    },

    /**
     * Invoca el servicio para eliminar los comentarios en un hallazgo
     * @function deleteComment
     * @param {String} id
     * @param {Object} data
     * @member integrates.projectFtry
     * @return {Object}
     */
    "deleteComment" (id, data) {
      const oopsAc = $translate.instant("proj_alerts.error_text");
      return $xhr.post($q, `${BASE.url}delete_comment`, {
        "_": Math.random(),
        data,
        id
      }, oopsAc);
    },

    /**
     * Invoca el servicio para tener las alertas de una compañia
     * @function getAlerts
     * @param {String} company
     * @param {String} project
     * @member integrates.projectFtry
     * @return {Object}
     */
    "getAlerts" (company, project) {
      const oopsAc = $translate.instant("proj_alerts.error_text");
      return $xhr.get($q, `${BASE.url}get_alerts`, {
        "_": Math.random(),
        company,
        project
      }, oopsAc);
    },

    /**
     * Invoca el servicio para tener los comentarios de un hallazgo
     * @function getComments
     * @param {String} id
     * @member integrates.projectFtry
     * @return {Object}
     */
    "getComments" (id) {
      const oopsAc = $translate.instant("proj_alerts.error_text");
      return $xhr.get($q, `${BASE.url}get_comments`, {
        "_": Math.random(),
        id
      }, oopsAc);
    },

    /**
     * Invoca el servicio para tener las evidencias de un hallazgo
     * @function getEvidences
     * @param {String} id
     * @member integrates.projectFtry
     * @return {Object}
     */
    "getEvidences" (id) {
      const oopsAc = $translate.instant("proj_alerts.error_text");
      return $xhr.get($q, `${BASE.url}get_evidences`, {
        "_": Math.random(),
        id
      }, oopsAc);
    },

    /**
     * Invoca el servicio para tener el exploit de un hallazgo
     * @function getExploit
     * @param {String} link
     * @member integrates.projectFtry
     * @return {Object}
     */
    "getExploit" (findingid, id) {
      const oopsAc = $translate.instant("proj_alerts.error_text");
      return $xhr.get($q, `${BASE.url}get_exploit`, {
        "_": Math.random(),
        findingid,
        id
      }, oopsAc);
    },

    /**
     * Invoca el servicio para tener el exploit de un hallazgo
     * @function getRecords
     * @param {String} findingid
     * @param {String} id
     * @member integrates.projectFtry
     * @return {Object}
     */
    "getRecords" (findingid, id) {
      const oopsAc = $translate.instant("proj_alerts.error_text");
      return $xhr.get($q, `${BASE.url}get_records`, {
        "_": Math.random(),
        findingid,
        id
      }, oopsAc);
    },

    /**
     * Invoca el servicio para tener los hallazgos de un proyecto
     * @function projectByName
     * @param {String} project
     * @param {String} filter
     * @member integrates.projectFtry
     * @return {Object}
     */
    "projectByName" (project, filter) {
      const oopsAc = $translate.instant("proj_alerts.error_text");
      return $xhr.get($q, `${BASE.url}get_findings`, {
        "_": Math.random(),
        filter,
        project
      }, oopsAc);
    }
  };
});
