# -*- coding: utf-8 -*-
"""Funciones para consumir la API de Formstack."""

from __future__ import absolute_import
import json
import requests
# pylint: disable=E0402
from __init__ import FI_FORMSTACK_TOKENS
from requests.exceptions import ConnectionError
from retrying import retry
from random import randint

requests.adapters.DEFAULT_RETRIES = 10
class FormstackAPI(object):

    headers_config = {}
    SUBMISSION_URL = "https://www.formstack.com/api/v2/submission/:id.json"
    #Finding URL
    FN_URL = "https://www.formstack.com/api/v2/form/1998500/submission.json"
    #Project information URL
    IN_URL = "https://www.formstack.com/api/v2/form/2696665/submission.json"
    #Eventuality URL
    EV_URL = "https://www.formstack.com/api/v2/form/1886931/submission.json"
    #Close finding URL
    CL_URL = "https://www.formstack.com/api/v2/form/2264008/submission.json"

    def __init__(self):
        """Constructor."""
        self.headers_config['User-Agent'] = 'Mozilla/5.0 (X11; Linux x86_64) \
AppleWebKit/537.36 (KHTML, like Gecko) FLUIDIntegrates/1.0'
        self.valid_token()

    @retry(retry_on_exception=ConnectionError, stop_max_attempt_number=5)
    def request(self, method, url, data=None):
        """Construye las peticiones usadas para consultar Formstack."""
        executed_request = None
        try:
            if method != "GET":
                self.headers_config["cache-control"] = "no-cache"
                self.headers_config["content-type"] = \
                    "application/x-www-form-urlencoded"
                url += "?oauth_token=:token".replace(":token",
                                                     self.TOKEN)
            else:
                if not data:
                    data = {"oauth_token": self.TOKEN}
                else:
                    data["oauth_token"] = self.TOKEN
            formstack_request = requests.request(
                method, url,
                data=data, headers=self.headers_config
            )
            executed_request = json.loads(formstack_request.text)
        # Formstack SSLError
        except requests.exceptions.SSLError:
            executed_request = None
        # Formstack Connection timeout
        except requests.exceptions.Timeout:
            executed_request = None
        # Fail token
        except requests.exceptions.HTTPError:
            executed_request = None
        # Fail connection
        except ConnectionError:
            executed_request = None
        # Fail json format
        except ValueError:
            executed_request = None
        # Fail json
        except TypeError:
            executed_request = None
        return executed_request

    def valid_token(self ):
        """Valida que un token sea valido y lo asigna."""
        ltokens= FI_FORMSTACK_TOKENS.split(',')
        url = "https://www.formstack.com/api/v2/submission/293276999.json"
        stat = 0
        while stat == 0:
            test_token = ltokens[randint(0,(len(ltokens)-1))]
            data = {"oauth_token": test_token}
            req = requests.request(
            'GET', url,
            data=data, headers=self.headers_config
            )
            if req.status_code == 429:
                stat=0
            else:
                self.TOKEN = test_token
                stat=1

    def delete_submission(self, submission_id):
        """ Elimina un id de submission """
        data = {'id': submission_id}
        url = self.SUBMISSION_URL.replace(":id", submission_id)
        return self.request("DELETE", url, data=data)

    def get_eventualities(self, project):
        """Obtiene las eventualidades partir del
        nombre de proyecto."""
        search_field = "29042322"
        data = {'search_field_1': search_field, 'search_value_1': project, 'per_page': 100}
        return self.request("GET", self.EV_URL, data=data)

    def get_submission(self, submission_id):
        """Obtiene un submission a partir de su ID."""
        url = self.SUBMISSION_URL.replace(":id", submission_id)
        return self.request("GET", url)

    def get_findings(self, project):
        """Obtiene los hallazgos a partir del nombre
        de proyecto."""
        search_field = "32201732"
        data = {'search_field_1': search_field, 'search_value_1': project, 'per_page': 100}
        return self.request("GET", self.FN_URL, data=data)

    def get_project_info(self, project):
        """Obtiene los hallazgos a partir del nombre
        de proyecto."""
        search_field = "52601266"
        data = {'search_field_1': search_field, 'search_value_1': project, 'per_page': 100}
        return self.request("GET", self.IN_URL, data=data)

    def get_closings_by_id(self, submission_id):
        """Obtiene los cierres de un ID de proyecto."""
        search_field = "39596063"
        data = {'search_field_1': search_field, 'search_value_1': submission_id}
        return self.request("GET", self.CL_URL, data=data)

    def get_closings_by_project(self, project):
        """Obtiene los cierres de un proyecto"""
        search_field = "39596058"
        data = {'search_field_1': search_field, 'search_value_1': project}
        return self.request("GET", self.CL_URL, data=data)

    def update(self, request_id, data_dto):
        """Actualiza un registro en formstack."""
        url = self.SUBMISSION_URL.replace(":id", request_id)
        return self.request("PUT", url, data=data_dto)
