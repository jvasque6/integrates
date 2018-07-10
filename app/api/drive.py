# -*- coding: utf-8 -*-
"""Integrates Google Drive API."""

from __future__ import print_function
import httplib2
import io
import logging
import rollbar
from apiclient import discovery
from oauth2client import client
from oauth2client import tools
from oauth2client.file import Storage
from django.conf import settings
# pylint: disable=E0402
from .. import util
from apiclient.http import MediaIoBaseDownload  # pylint: disable=import-error
from apiclient.http import HttpError  # pylint: disable=import-error

logging.getLogger('googleapiclient.discovery_cache').setLevel(logging.ERROR)


class DriveAPI(object):
    """ Class to consume the Google Drive API. """

    SCOPES = []
    CLIENT_SECRET_FILE = ""
    CLIENT_AUTHOR_FILE = ""
    APPLICATION_NAME = ""
    FILE = None

    def __init__(self, drive_file_id=""):
        """ Class constructor """
        self.SCOPES = settings.DRIVE_SCOPES
        self.CLIENT_SECRET_FILE = settings.DRIVE_SECRET_FILE
        self.CLIENT_AUTHOR_FILE = settings.DRIVE_AUTHOR_FILE
        self.APPLICATION_NAME = settings.DRIVE_APP_NAME
        if(drive_file_id != ""):
            self.FILE = self.download(drive_file_id)

    def download(self, drive_file_id=""):
        """ Download the Google Drive files in /tmp/. """
        filename = "/tmp/:id.tmp".replace(":id", drive_file_id)
        credentials = self.get_credentials()
        http = credentials.authorize(httplib2.Http())
        file_id = drive_file_id
        drive_service = discovery.build('drive', 'v3', http=http)
        request = drive_service.files().get_media(fileId=file_id)
        fh = io.FileIO(filename, 'wb')
        downloader = MediaIoBaseDownload(fh, request)
        done = False
        try:
            while not done:
                _, done = downloader.next_chunk()

            if util.assert_file_mime(filename, ["image/png", "image/jpeg",
                                                "image/gif", "text/x-c",
                                                "text/x-python", "text/plain",
                                                "text/html"]):
                return fh
        except HttpError:
            rollbar.report_message('Error: Unable to download the file','error')

        return None

    def download_images(self, drive_file_id=""):
        """ Download the Google Drive images in /tmp/. """
        hard_path = "/usr/src/app/app/documentator/images/"
        filename = hard_path + ":id.png".replace(":id", drive_file_id)
        credentials = self.get_credentials()
        http = credentials.authorize(httplib2.Http())
        file_id = drive_file_id
        drive_service = discovery.build('drive', 'v3', http=http)
        request = drive_service.files().get_media(fileId=file_id)
        fh = io.FileIO(filename, 'wb')
        downloader = MediaIoBaseDownload(fh, request)
        done = False
        try:
            while not done:
                _, done = downloader.next_chunk()

            if util.assert_file_mime(filename, ["image/png", "image/jpeg", "image/gif"]):
                return fh
        except HttpError:
            rollbar.report_message('Error: Unable to download the image','error')

        return None

    def get_credentials(self):
        """ Gets the credentials to authenticate in the API. """
        store = Storage(self.CLIENT_AUTHOR_FILE)
        credentials = store.get()
        if not credentials or credentials.invalid:
            flow = client.flow_from_clientsecrets(
                self.CLIENT_SECRET_FILE,
                self.SCOPES
            )
            flow.user_agent = self.APPLICATION_NAME
            credentials = tools.run_flow(flow, store)
        return credentials
