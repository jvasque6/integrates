""" GraphQL Entity for Formstack Findings """
# pylint: disable=F0401
# pylint: disable=no-self-use
# pylint: disable=super-init-not-called
# pylint: disable=relative-beyond-top-level
# Disabling this rule is necessary for importing modules beyond the top level
# directory.

from __future__ import absolute_import
from graphene import Boolean, Field, Mutation, ObjectType, String
from app.decorators import require_login, require_role, require_event_access_gql
from app.dto.eventuality import event_data
from app.domain.event import (
    update_event, get_event_project_name
)
from .. import util


class Events(ObjectType):  # noqa pylint: disable=too-many-instance-attributes
    """ Formstack Events Class """
    id = String()  # noqa pylint: disable=invalid-name
    success = Boolean()
    error_message = String()
    analyst = String()
    client = String()
    project_name = String()
    client_project = String()
    detail = String()
    evidence = String()
    event_type = String()
    event_date = String()
    event_status = String()
    affectation = String()
    accessibility = String()
    affected_components = String()
    context = String()
    subscription = String()
    evidence_file = String()

    def __init__(self, identifier):
        """ Class constructor """
        self.id = ''  # noqa pylint: disable=invalid-name
        self.analyst = ''
        self.client = ''
        self.project_name = ''
        self.client_project = ''
        self.event_type = ''
        self.event_date = ''
        self.detail = ''
        self.affectation = ''
        self.event_status = ''
        self.evidence = ''
        self.accessibility = ''
        self.affected_components = ''
        self.context = ''
        self.subscription = ''
        self.evidence_file = ''

        event_id = str(identifier)
        resp = event_data(event_id)

        if resp:
            self.id = event_id
            self.analyst = resp.get('analyst')
            self.client = resp.get('client')
            self.project_name = resp.get('projectName')
            self.client_project = resp.get('clientProject')
            self.event_type = resp.get('eventType')
            self.event_date = resp.get('eventDate')
            self.detail = resp.get('detail')
            self.affectation = resp.get('affectation')
            self.event_status = resp.get('eventStatus')
            self.evidence = resp.get('evidence', '')
            self.evidence_file = resp.get('evidence_file', '')
            self.accessibility = resp.get('accessibility')
            self.affected_components = resp.get('affectedComponents')
            self.context = resp.get('context')
            self.subscription = resp.get('subscription')
        else:
            self.success = False
            self.error_message = 'Finding does not exist'
        self.success = True

    def resolve_id(self, info):
        """ Resolve id attribute """
        del info
        return self.id

    def resolve_analyst(self, info):
        """ Resolve analyst attribute """
        del info
        return self.analyst

    def resolve_client(self, info):
        """ Resolve client attribute """
        del info
        return self.client

    def resolve_evidence(self, info):
        """ Resolve evidence attribute """
        del info
        return self.evidence

    def resolve_project_name(self, info):
        """ Resolve project_name attribute """
        del info
        return self.project_name

    def resolve_client_project(self, info):
        """ Resolve client_project attribute """
        del info
        return self.client_project

    def resolve_event_type(self, info):
        """ Resolve event_type attribute """
        del info
        return self.event_type

    def resolve_detail(self, info):
        """ Resolve detail attribute """
        del info
        return self.detail

    def resolve_event_date(self, info):
        """ Resolve date attribute """
        del info
        return self.event_date

    def resolve_event_status(self, info):
        """ Resolve status attribute """
        del info
        return self.event_status

    def resolve_affectation(self, info):
        """ Resolve affectation attribute """
        del info
        if not self.affectation:
            return ''
        return self.affectation

    def resolve_accessibility(self, info):
        """ Resolve accessibility attribute """
        del info
        if not self.accessibility:
            return ''
        return self.accessibility

    def resolve_affected_components(self, info):
        """ Resolve affected components attribute """
        del info
        if not self.affected_components:
            return ''
        return self.affected_components

    def resolve_context(self, info):
        """ Resolve context attribute """
        del info
        return self.context

    def resolve_subscription(self, info):
        """ Resolve subscription attribute """
        del info
        return self.subscription

    def resolve_evidence_file(self, info):
        """ Resolve evidence file attribute """
        del info
        return self.evidence_file


class UpdateEvent(Mutation):
    """Update event status."""

    class Arguments(object):
        event_id = String(required=True)
        affectation = String(required=True)
    success = Boolean()
    event = Field(Events)

    @require_login
    @require_role(['analyst', 'admin'])
    @require_event_access_gql
    def mutate(self, info, event_id, affectation):
        success = update_event(event_id, affectation, info)
        ret = UpdateEvent(success=success, event=Events(identifier=event_id))
        project_name = get_event_project_name(event_id)
        util.invalidate_cache(event_id)
        util.invalidate_cache(project_name)
        return ret
