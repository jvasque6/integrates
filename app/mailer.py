# pylint: disable=relative-beyond-top-level
from __future__ import absolute_import
import mandrill
from __init__ import FI_MANDRILL_API_KEY, FI_TEST_PROJECTS
from .dao import integrates_dao

API_KEY = FI_MANDRILL_API_KEY
VERIFY_TAG = ['verify']
COMMENTS_TAG = ['comments']
VULNERABILITIES_TAG = ['vulnerabilities']
GENERAL_TAG = ['general']


def _remove_test_projects(context, test_proj_list):
    findings = context.get('findings')
    if findings and isinstance(findings, list):
        new_findings = list()
        for fin in findings:
            fin_proj = fin.get('project', '').lower()
            if fin_proj not in test_proj_list:
                new_findings.append(fin)
        context['total'] = len(new_findings)
        context['findings'] = new_findings
    return context


def _get_recipient_first_name(email):
    first_name = integrates_dao.get_user_first_name(email)
    if not first_name:
        first_name = email.split('@')[0]
    else:
        # First name exists in database
        pass
    return first_name


def _send_mail(template_name, email_to, context, tags):
    project = context.get('project', '').lower()
    test_proj_list = FI_TEST_PROJECTS.split(',')
    new_context = _remove_test_projects(context, test_proj_list)
    if project not in test_proj_list:
        mandrill_client = mandrill.Mandrill(API_KEY)
        message = {
            'to': [],
            'global_merge_vars': [],
            'merge_vars': []
        }
        for email in email_to:
            fname_mail = _get_recipient_first_name(email)
            merge_var = {'rcpt': email,
                         'vars': [{'name': 'fname',
                                   'content': fname_mail}]}
            message['to'].append({'email': email})
            message['merge_vars'].append(merge_var)
        for key, value in new_context.items():
            message['global_merge_vars'].append(
                {'name': key, 'content': value}
            )
        message['tags'] = tags
        mandrill_client.messages.send_template(template_name, [], message)
    else:
        # Mail should not be sent if is a test project
        pass


def send_mail_new_vulnerabilities(email_to, context):
    _send_mail('newvulnerabilitiesintegrates', email_to, context=context, tags=VULNERABILITIES_TAG)


def send_mail_new_user(email_to, context):
    _send_mail('userfindingintegrates', email_to, context=context, tags=GENERAL_TAG)


def send_mail_delete_finding(email_to, context):
    _send_mail('deletefindingintegrates', email_to, context=context, tags=GENERAL_TAG)


def send_mail_remediate_finding(email_to, context):
    _send_mail('remediate-finding',
               email_to,
               context=context,
               tags=VERIFY_TAG)


def send_mail_comment(email_to, context):
    _send_mail('new-comment',
               email_to,
               context=context,
               tags=COMMENTS_TAG)


def send_mail_verified_finding(email_to, context):
    _send_mail('verified-finding', email_to, context=context, tags=VERIFY_TAG)


def send_mail_new_remediated(email_to, context):
    _send_mail('newremediatefindingintegrates', email_to, context=context, tags=GENERAL_TAG)


def send_mail_delete_draft(email_to, context):
    _send_mail('deletedraftintegrates', email_to, context=context, tags=GENERAL_TAG)


def send_mail_new_releases(email_to, context):
    _send_mail('newreleasesintegrates', email_to, context=context, tags=GENERAL_TAG)


def send_mail_access_granted(email_to, context):
    _send_mail('accessgrantedintegrates', email_to, context=context, tags=GENERAL_TAG)


def send_mail_new_version(email_to, context):
    _send_mail('new_version', email_to, context=context, tags=GENERAL_TAG)


def send_mail_resources(email_to, context):
    _send_mail('resources-changes',
               email_to,
               context=context,
               tags=GENERAL_TAG)


def send_mail_unsolved_events(email_to, context):
    _send_mail('unsolvedevents', email_to, context=context, tags=GENERAL_TAG)


def send_mail_accepted_finding(email_to, context):
    _send_mail('acceptedfinding', email_to, context=context, tags=GENERAL_TAG)


def send_mail_project_deletion(email_to, context):
    _send_mail('projectdeletion', email_to, context=context, tags=GENERAL_TAG)
