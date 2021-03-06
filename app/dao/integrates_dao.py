# pylint: disable=too-many-lines
from __future__ import absolute_import
from datetime import datetime
from django.db import connections
from django.db.utils import OperationalError
from boto3 import resource
from boto3.dynamodb.conditions import Key, Attr
from botocore.exceptions import ClientError
# pylint: disable=E0402
from __init__ import (
    FI_AWS_DYNAMODB_ACCESS_KEY, FI_AWS_DYNAMODB_SECRET_KEY
)
import rollbar
from app import util
from ..utils import forms


DYNAMODB_RESOURCE = resource('dynamodb',
                             aws_access_key_id=FI_AWS_DYNAMODB_ACCESS_KEY,
                             aws_secret_access_key=FI_AWS_DYNAMODB_SECRET_KEY,
                             region_name='us-east-1')


def create_user_dao(email, username='-', first_name='-', last_name='-', first_time='-'):
    """ Add a new user. """
    role = 'None'
    if first_time == "1":
        last_login = datetime.now()
    else:
        last_login = "1111-1-1 11:11:11"
    date_joined = last_login

    with connections['integrates'].cursor() as cursor:
        query = 'SELECT id FROM users WHERE email = %s'
        cursor.execute(query, (email,))
        row = cursor.fetchone()
        if row is None:
            query = 'INSERT INTO users(username, first_name, last_name, \
email, role, last_login, date_joined) \
VALUES (%s, %s, %s, %s, %s, %s, %s)'
            cursor.execute(query,
                           (username, first_name,
                            last_name, email, role,
                            last_login, date_joined))
            row = cursor.fetchone()
    return row


def create_project_dao(project=None, description=None):
    """ Add a new project. """
    if project and description:
        project = project.lower()

        with connections['integrates'].cursor() as cursor:
            query = 'SELECT * FROM projects WHERE project=%s'
            cursor.execute(query, (project,))
            row = cursor.fetchone()

            if row is not None:
                # Project already exists.
                return False

            query = 'INSERT INTO projects(project, description) \
VALUES (%s, %s)'
            try:
                cursor.execute(query, (project, description,))
                row = cursor.fetchone()
            except OperationalError:
                rollbar.report_exc_info()
                return False
        return True
    return False


def update_user_login_dao(email):
    """Update the user's last login date. """
    last_login = datetime.now()

    with connections['integrates'].cursor() as cursor:
        query = 'UPDATE users SET last_login=%s WHERE email = %s'
        cursor.execute(query, (last_login, email,))
        row = cursor.fetchone()
    return row


def update_user_data(email, username, first_name, last_name):
    """Update the user's last login date. """
    date_joined = datetime.now()
    with connections['integrates'].cursor() as cursor:
        query = 'UPDATE users SET username=%s, first_name=%s, last_name=%s, date_joined=%s   \
                 WHERE email = %s'
        cursor.execute(query, (username, first_name, last_name, date_joined, email,))
        row = cursor.fetchone()
    return row


def get_user_last_login_dao(email):
    """ Get the user's last login date. """
    with connections['integrates'].cursor() as cursor:
        query = 'SELECT last_login FROM users WHERE email = %s'
        cursor.execute(query, (email,))
        row = cursor.fetchone()
    if row is None:
        return '-'
    return unicode(row[0])


def get_user_first_login_dao(email):
    """ Get the user's first login date. """
    with connections['integrates'].cursor() as cursor:
        query = 'SELECT date_joined FROM users WHERE email = %s'
        cursor.execute(query, (email,))
        row = cursor.fetchone()
    if row is None:
        return '-'
    return unicode(row[0])


def get_organization_dao(email):
    """ Get the company of a user. """
    with connections['integrates'].cursor() as cursor:
        query = 'SELECT company FROM users WHERE email = %s'
        cursor.execute(query, (email,))
        row = cursor.fetchone()
    if row is None:
        return "None"
    return row[0]


def get_role_dao(email):
    """ Get the role of a user. """
    with connections['integrates'].cursor() as cursor:
        query = 'SELECT role FROM users WHERE email = %s'
        cursor.execute(query, (email,))
        row = cursor.fetchone()
    if row is None:
        return "None"
    return row[0]


def get_user_first_name(email):
    """ Get the first name of a user. """
    with connections['integrates'].cursor() as cursor:
        query = 'SELECT first_name FROM users WHERE email = %s'
        cursor.execute(query, (email,))
        row = cursor.fetchone()
    if row:
        first_name = row[0]
    else:
        first_name = ''
    return first_name


def get_project_description(project):
    """ Get the description of a project. """
    with connections['integrates'].cursor() as cursor:
        query = 'SELECT description FROM projects WHERE project = %s'
        cursor.execute(query, (project,))
        row = cursor.fetchone()
    if row is None:
        return "None"
    return row[0]


def get_registered_projects():
    """ Get all the active projects. """
    with connections['integrates'].cursor() as cursor:
        query = 'SELECT DISTINCT(project) FROM projects'
        cursor.execute(query)
        rows = cursor.fetchall()
    if rows is None:
        return "None"
    return rows


def is_registered_dao(email):
    """ Check if the user is registered. """
    with connections['integrates'].cursor() as cursor:
        query = 'SELECT registered FROM users WHERE email = %s'
        cursor.execute(query, (email,))
        row = cursor.fetchone()
    if row is None:
        return '0'
    if row[0] == 1:
        return '1'
    return '0'


def is_in_database(email):
    """ Check if the user exists in DB. """
    with connections['integrates'].cursor() as cursor:
        query = 'SELECT id FROM users WHERE email = %s'
        cursor.execute(query, (email,))
        row = cursor.fetchone()
    if row is None:
        return False
    return True


def has_complete_data(email):
    """ Check if the user has all data in DB . """
    with connections['integrates'].cursor() as cursor:
        query = 'SELECT username FROM users WHERE email = %s'
        cursor.execute(query, (email,))
        row = cursor.fetchone()
    if row is None or row[0] == '-':
        return False
    return True


def add_access_to_project_dao(email, project_name):
    """ Give access of a project to a user. """
    if has_access_to_project_dao(email, project_name):
        return True
    with connections['integrates'].cursor() as cursor:
        query = 'SELECT id FROM users WHERE email = %s'
        try:
            cursor.execute(query, (email,))
            user_id = cursor.fetchone()
        except OperationalError:
            user_id = None

        query = 'SELECT id FROM projects WHERE project = %s'
        try:
            cursor.execute(query, (project_name,))
            project_id = cursor.fetchone()
        except OperationalError:
            rollbar.report_exc_info()
            project_id = None

        if project_id and user_id:
            query = 'INSERT INTO project_access(user_id, project_id, \
has_access) VALUES(%s, %s, %s)'
            try:
                cursor.execute(query, (user_id[0], project_id[0], 1))
                return True
            except OperationalError:
                rollbar.report_exc_info()
                return False
    return False


def has_access_to_project_dao(email, project_name):
    """ Verify that a user has access to a specific project. """
    with connections['integrates'].cursor() as cursor:
        query = 'SELECT id FROM users WHERE email = %s'
        try:
            cursor.execute(query, (email,))
            user_id = cursor.fetchone()
        except OperationalError:
            rollbar.report_exc_info()
            return False

        query = 'SELECT id FROM projects WHERE project = %s'
        try:
            cursor.execute(query, (project_name.lower(),))
            project_id = cursor.fetchone()
        except OperationalError:
            rollbar.report_exc_info()
            return False

        if project_id and user_id:
            query = 'SELECT has_access FROM project_access \
WHERE user_id = %s and project_id = %s'
            cursor.execute(query, (user_id[0], project_id[0],))
            has_access = cursor.fetchone()
        else:
            return False
    if has_access is not None:
        if has_access[0] == 1:
            return True
    return False


def remove_all_project_access_dao(project_name=None):
    """ Remove access permission to all users in a project. """
    if project_name:
        project_name = project_name.lower()

        with connections['integrates'].cursor() as cursor:
            query = 'SELECT id FROM projects WHERE project = %s'
            try:
                cursor.execute(query, (project_name,))
                project_id = cursor.fetchone()
            except OperationalError:
                rollbar.report_exc_info()
                return False

            if project_id:
                query = 'UPDATE project_access SET has_access=0 \
WHERE project_id = %s'
                try:
                    cursor.execute(query, (project_id[0],))
                    cursor.fetchone()
                    return True
                except OperationalError:
                    rollbar.report_exc_info()
                    return False
            else:
                return False
    return False


def add_all_access_to_project_dao(project_name=None):
    """ Add access permission to all users of a project. """
    if project_name:
        project_name = project_name.lower()

        with connections['integrates'].cursor() as cursor:
            query = 'SELECT id FROM projects WHERE project = %s'
            try:
                cursor.execute(query, (project_name,))
                project_id = cursor.fetchone()
            except OperationalError:
                rollbar.report_exc_info()
                return False

            if project_id:
                query = 'UPDATE project_access SET has_access=1 \
WHERE project_id = %s'
                try:
                    cursor.execute(query, (project_id[0],))
                    cursor.fetchone()
                    return True
                except OperationalError:
                    rollbar.report_exc_info()
                    return False
            else:
                return False
    return False


def register(email):
    """ Register user in the DB. """
    with connections['integrates'].cursor() as cursor:
        query = 'UPDATE users SET registered=1 WHERE email = %s'
        cursor.execute(query, (email,))
        row = cursor.fetchone()
    return row


def assign_role(email, role):
    """ Assigns a role to a user in the DB. """
    if (role != 'analyst' and role != 'customer' and
            role != 'admin' and role != 'customeradmin'):
        return False
    with connections['integrates'].cursor() as cursor:
        query = 'UPDATE users SET role=%s WHERE email = %s'
        cursor.execute(query, (role, email,))
        row = cursor.fetchone()
    return row


def assign_company(email, company):
    """ Assigns a company to a user in the DB."""
    with connections['integrates'].cursor() as cursor:
        query = 'UPDATE users SET company=%s WHERE email = %s'
        cursor.execute(query, (company, email,))
        row = cursor.fetchone()
    return row


def get_project_users(project):
    """ Gets the users related to a project. """
    with connections['integrates'].cursor() as cursor:
        query = 'SELECT users.email, project_access.has_access \
FROM users LEFT JOIN project_access ON users.id = project_access.user_id \
WHERE project_access.project_id=(SELECT id FROM projects where project=%s)'
        try:
            cursor.execute(query, (project,))
            rows = cursor.fetchall()
        except OperationalError:
            rollbar.report_exc_info()
            rows = []
    return rows


def get_projects_by_user(user_id):
    """ Gets the users related to a project. """
    with connections['integrates'].cursor() as cursor:
        query = 'SELECT projects.project, projects.description, \
project_access.has_access FROM project_access INNER JOIN users \
ON project_access.user_id=users.id INNER JOIN projects \
ON project_access.project_id=projects.id WHERE users.email=%s \
ORDER BY projects.project ASC'
        cursor.execute(query, (user_id,))
        rows = cursor.fetchall()
    return rows


def get_user_dynamo(email):
    """ Get legal notice acceptance status """
    table = DYNAMODB_RESOURCE.Table('FI_users')
    filter_key = 'email'
    filtering_exp = Key(filter_key).eq(email)
    response = table.query(KeyConditionExpression=filtering_exp)
    items = response['Items']
    while True:
        if response.get('LastEvaluatedKey'):
            response = table.query(
                KeyConditionExpression=filtering_exp,
                ExclusiveStartKey=response['LastEvaluatedKey'])
            items += response['Items']
        else:
            break
    return items


def update_legal_remember_dynamo(email, remember):
    """ Remember legal notice acceptance """
    table = DYNAMODB_RESOURCE.Table('FI_users')
    item = get_user_dynamo(email)
    if item == []:
        try:
            response = table.put_item(
                Item={
                    'email': email,
                    'legal_remember': remember
                }
            )
            resp = response['ResponseMetadata']['HTTPStatusCode'] == 200
            return resp
        except ClientError:
            rollbar.report_exc_info()
            return False
    else:
        try:
            response = table.update_item(
                Key={
                    'email': email
                },
                UpdateExpression='SET legal_remember = :val1',
                ExpressionAttributeValues={
                    ':val1': remember
                }
            )
            resp = response['ResponseMetadata']['HTTPStatusCode'] == 200
            return resp
        except ClientError:
            rollbar.report_exc_info()
            return False


def add_phone_to_user_dynamo(email, phone):
    """Update user phone number."""
    table = DYNAMODB_RESOURCE.Table('FI_users')
    item = get_user_dynamo(email)
    if item == []:
        try:
            response = table.put_item(
                Item={
                    'email': email,
                    'phone': phone
                }
            )
            resp = response['ResponseMetadata']['HTTPStatusCode'] == 200
            return resp
        except ClientError:
            rollbar.report_exc_info()
            return False
    else:
        try:
            response = table.update_item(
                Key={
                    'email': email
                },
                UpdateExpression='SET phone = :val1',
                ExpressionAttributeValues={
                    ':val1': phone
                }
            )
            resp = response['ResponseMetadata']['HTTPStatusCode'] == 200
            return resp
        except ClientError:
            rollbar.report_exc_info()
            return False


def get_vulns_by_id_dynamo(project_name, unique_id):
    """ Gets findings info by finding ID. """
    table = DYNAMODB_RESOURCE.Table('FI_findings_email')
    filter_key = 'project_name'
    filter_sort = 'unique_id'
    filtering_exp = Key(filter_key).eq(project_name) & \
        Key(filter_sort).eq(unique_id)
    response = table.query(KeyConditionExpression=filtering_exp)
    items = response['Items']
    while True:
        if response.get('LastEvaluatedKey'):
            response = table.query(
                KeyConditionExpression=filtering_exp,
                ExclusiveStartKey=response['LastEvaluatedKey'])
            items += response['Items']
        else:
            break
    return items


def delete_vulns_email_dynamo(project_name, unique_id):
    """Delete project in DynamoDb."""
    table = DYNAMODB_RESOURCE.Table('FI_findings_email')
    try:
        response = table.delete_item(
            Key={
                'project_name': project_name,
                'unique_id': int(unique_id),
            }
        )
        resp = response['ResponseMetadata']['HTTPStatusCode'] == 200
        return resp
    except ClientError:
        rollbar.report_exc_info()
        return False


def get_company_alert_dynamo(company_name, project_name):
    """ Get alerts of a company. """
    company_name = company_name.lower()
    project_name = project_name.lower()
    table = DYNAMODB_RESOURCE.Table('FI_alerts_by_company')
    filter_key = 'company_name'
    filter_sort = 'project_name'
    if project_name == 'all':
        filtering_exp = Key(filter_key).eq(company_name)
        response = table.query(
            KeyConditionExpression=filtering_exp)
    else:
        filtering_exp = Key(filter_key).eq(company_name) & \
            Key(filter_sort).eq(project_name)
        response = table.query(KeyConditionExpression=filtering_exp)
    items = response['Items']
    while True:
        if response.get('LastEvaluatedKey'):
            response = table.query(
                KeyConditionExpression=filtering_exp,
                ExclusiveStartKey=response['LastEvaluatedKey'])
            items += response['Items']
        else:
            break
    return items


def set_company_alert_dynamo(message, company_name, project_name):
    """ Create, update or activate an alert for a company. """
    project = project_name.lower()
    if project != 'all':
        with connections['integrates'].cursor() as cursor:
            query = 'SELECT * FROM projects WHERE project=%s'
            cursor.execute(query, (project,))
            row = cursor.fetchone()
            if row is None:
                # Project already exists.
                return False
    company_name = company_name.lower()
    project_name = project_name.lower()
    table = DYNAMODB_RESOURCE.Table('FI_alerts_by_company')
    item = get_company_alert_dynamo(company_name, project_name)
    if item == []:
        try:
            response = table.put_item(
                Item={
                    'company_name': company_name,
                    'project_name': project_name,
                    'message': message,
                    'status_act': '1',
                }
            )
            resp = response['ResponseMetadata']['HTTPStatusCode'] == 200
            return resp
        except ClientError:
            rollbar.report_exc_info()
            return False
    else:
        for _item in item:
            try:
                response = table.update_item(
                    Key={
                        'company_name': _item['company_name'],
                        'project_name': _item['project_name'],
                    },
                    UpdateExpression='SET message = :val1, status_act = :val2',
                    ExpressionAttributeValues={
                        ':val1': str(message),
                        ':val2': '1',
                    }
                )
            except ClientError:
                rollbar.report_exc_info()
                return False
        resp = response['ResponseMetadata']['HTTPStatusCode'] == 200
        return resp


def change_status_comalert_dynamo(message, company_name, project_name):
    """ Activate or deactivate the alert of a company. """
    message = message.lower()
    company_name = company_name.lower()
    project_name = project_name.lower()
    table = DYNAMODB_RESOURCE.Table('FI_alerts_by_company')
    if ((project_name == 'all' and message == 'deactivate') or
            (project_name != 'all' and message == 'deactivate')):
        status = '0'
    else:
        status = '1'
    item = get_company_alert_dynamo(company_name, project_name)
    for _item in item:
        payload = {'company_name': _item['company_name'],
                   'project_name': _item['project_name'], }
        try:
            table.update_item(
                Key=payload,
                UpdateExpression='SET status_act = :val1',
                ExpressionAttributeValues={
                    ':val1': status,
                }
            )
        except ClientError:
            rollbar.report_exc_info()
            return False


def remove_access_project_dao(email=None, project_name=None):
    """ Remove a user's access to a project. """
    if email and project_name:
        project_name = project_name.lower()

        with connections['integrates'].cursor() as cursor:
            query = 'SELECT id FROM users WHERE email = %s'
            try:
                cursor.execute(query, (email,))
                user_id = cursor.fetchone()
            except OperationalError:
                rollbar.report_exc_info()
                return False

            query = 'SELECT id FROM projects WHERE project = %s'
            try:
                cursor.execute(query, (project_name,))
                project_id = cursor.fetchone()
            except OperationalError:
                rollbar.report_exc_info()
                return False

            if project_id and user_id:
                query = 'DELETE FROM project_access WHERE user_id = %s and \
        project_id = %s'
                try:
                    cursor.execute(query, (user_id[0], project_id[0],))
                    cursor.fetchone()
                    return True
                except OperationalError:
                    rollbar.report_exc_info()
                    return False
            else:
                return False
    return False


def all_users_report(company_name, finish_date):
    """ Gets the number of registered users in integrates. """
    with connections['integrates'].cursor() as cursor:
        query = 'SELECT COUNT(DISTINCT(users.id)) FROM users  \
        LEFT JOIN project_access ON users.id = project_access.user_id \
        WHERE project_access.has_access = 1 and users.registered = 1 and \
        users.company != %s and users.date_joined <= %s'
        try:
            cursor.execute(query, (company_name, finish_date,))
            rows = cursor.fetchall()
        except OperationalError:
            rollbar.report_exc_info()
            rows = []
    return rows


def logging_users_report(company_name, init_date, finish_date):
    """ Gets the number of logged in users in integrates. """
    with connections['integrates'].cursor() as cursor:
        query = 'SELECT COUNT(id) FROM users WHERE company != %s and \
        registered = 1 and last_login >= %s and last_login <= %s'
        try:
            cursor.execute(query, (company_name, init_date, finish_date,))
            rows = cursor.fetchall()
        except OperationalError:
            rollbar.report_exc_info()
            rows = []
    return rows


def get_all_companies():
    with connections['integrates'].cursor() as cursor:
        query = 'SELECT DISTINCT UPPER(company) FROM users where company != %s'
        try:
            cursor.execute(query, ("None",))
            rows = cursor.fetchall()
        except OperationalError:
            rollbar.report_exc_info()
            rows = []
    return rows


def get_all_users(company_name):
    with connections['integrates'].cursor() as cursor:
        query = 'SELECT COUNT(id) FROM users WHERE company = %s and \
        registered = 1'
        try:
            cursor.execute(query, (company_name,))
            rows = cursor.fetchall()
        except OperationalError:
            rollbar.report_exc_info()
            rows = []
    return rows


def all_inactive_users():
    """ Gets amount of inactive users in Integrates. """
    with connections['integrates'].cursor() as cursor:
        query = 'SELECT id, last_login FROM users WHERE registered = 0'
        try:
            cursor.execute(query)
            rows = cursor.fetchall()
        except OperationalError:
            rollbar.report_exc_info()
            rows = []
    return rows


def delete_user(user_id=None):
    """ Delete user of Integrates DB. """
    if user_id:
        with connections['integrates'].cursor() as cursor:
            query = 'DELETE FROM users WHERE id = %s'
            try:
                cursor.execute(query, (user_id,))
                cursor.fetchone()
                return True
            except OperationalError:
                rollbar.report_exc_info()
                return False
        return False


def delete_project(project=None):
    """Delete project of Integrates DB."""
    if project:
        with connections['integrates'].cursor() as cursor:
            query = 'DELETE FROM projects WHERE project = %s'
            try:
                cursor.execute(query, (project,))
                cursor.fetchone()
                return True
            except OperationalError:
                rollbar.report_exc_info()
                return False
        return False


def get_admins():
    with connections['integrates'].cursor() as cursor:
        query = 'SELECT email FROM users WHERE role = %s'
        try:
            cursor.execute(query, ("admin", ))
            rows = cursor.fetchall()
        except OperationalError:
            rollbar.report_exc_info()
            rows = []
    return rows


def get_comments_dynamo(finding_id, comment_type):
    """ Get comments of a finding. """
    table = DYNAMODB_RESOURCE.Table('FI_comments')
    filter_key = 'finding_id'
    filter_attribute = 'comment_type'
    filtering_exp = Key(filter_key).eq(finding_id) & Key(filter_attribute).eq(comment_type)
    response = table.scan(FilterExpression=filtering_exp)
    items = response['Items']
    while True:
        if response.get('LastEvaluatedKey'):
            response = table.scan(
                FilterExpression=filtering_exp,
                ExclusiveStartKey=response['LastEvaluatedKey'])
            items += response['Items']
        else:
            break
    return items


def add_finding_comment_dynamo(finding_id, email, comment_data):
    """ Add a comment in a finding. """
    table = DYNAMODB_RESOURCE.Table('FI_comments')
    try:
        payload = {
            'finding_id': finding_id,
            'email': email
        }
        payload.update(comment_data)
        response = table.put_item(
            Item=payload
        )
        resp = response['ResponseMetadata']['HTTPStatusCode'] == 200
        return resp
    except ClientError:
        rollbar.report_exc_info()
        return False


def get_project_comments_dynamo(project_name):
    """ Get comments of a project. """
    table = DYNAMODB_RESOURCE.Table('fi_project_comments')
    filter_key = 'project_name'
    filtering_exp = Key(filter_key).eq(project_name)
    response = table.scan(FilterExpression=filtering_exp)
    items = response['Items']
    while True:
        if response.get('LastEvaluatedKey'):
            response = table.scan(
                FilterExpression=filtering_exp,
                ExclusiveStartKey=response['LastEvaluatedKey'])
            items += response['Items']
        else:
            break
    return items


def add_project_comment_dynamo(project_name, email, comment_data):
    """ Add a comment in a project. """
    table = DYNAMODB_RESOURCE.Table('fi_project_comments')
    try:
        payload = {
            'project_name': project_name,
            'email': email
        }
        payload.update(comment_data)
        response = table.put_item(
            Item=payload
        )
        resp = response['ResponseMetadata']['HTTPStatusCode'] == 200
        return resp
    except ClientError:
        rollbar.report_exc_info()
        return False


def delete_comment_dynamo(finding_id, user_id):
    """ Delete a comment in a finding. """
    table = DYNAMODB_RESOURCE.Table('FI_comments')
    try:
        response = table.delete_item(
            Key={
                'finding_id': finding_id,
                'user_id': user_id
            }
        )
        resp = response['ResponseMetadata']['HTTPStatusCode'] == 200
        return resp
    except ClientError:
        rollbar.report_exc_info()
        return False


def get_remediated_dynamo(finding_id):
    """ Gets the remediated status of a finding. """
    table = DYNAMODB_RESOURCE.Table('FI_remediated')
    filter_key = 'finding_id'
    filtering_exp = Key(filter_key).eq(finding_id)
    response = table.query(KeyConditionExpression=filtering_exp)
    items = response['Items']
    while True:
        if response.get('LastEvaluatedKey'):
            response = table.query(
                KeyConditionExpression=filtering_exp,
                ExclusiveStartKey=response['LastEvaluatedKey'])
            items += response['Items']
        else:
            break
    return items


def add_remediated_dynamo(finding_id, remediated, project, finding_name):
    """Create or update a remediate status."""
    table = DYNAMODB_RESOURCE.Table('FI_remediated')
    item = get_remediated_dynamo(finding_id)
    if item == []:
        try:
            response = table.put_item(
                Item={
                    'finding_id': finding_id,
                    'remediated': remediated,
                    'project': project.lower(),
                    'finding_name': finding_name
                }
            )
            resp = response['ResponseMetadata']['HTTPStatusCode'] == 200
            return resp
        except ClientError:
            rollbar.report_exc_info()
            return False
    else:
        try:
            response = table.update_item(
                Key={
                    'finding_id': finding_id,
                },
                UpdateExpression='SET remediated = :val1',
                ExpressionAttributeValues={
                    ':val1': remediated
                }
            )
            resp = response['ResponseMetadata']['HTTPStatusCode'] == 200
            return resp
        except ClientError:
            rollbar.report_exc_info()
            return False


def get_remediated_allfin_dynamo(filter_value):
    """ Gets the treatment of all the findings. """
    table = DYNAMODB_RESOURCE.Table('FI_remediated')
    filter_key = 'remediated'
    filtering_exp = Key(filter_key).eq(filter_value)
    response = table.scan(FilterExpression=filtering_exp)
    items = response['Items']
    while True:
        if response.get('LastEvaluatedKey'):
            response = table.scan(
                FilterExpression=filtering_exp,
                ExclusiveStartKey=response['LastEvaluatedKey'])
            items += response['Items']
        else:
            break
    return items


def get_remediated_project_dynamo(project_name):
    """Gets the treatment by project."""
    table = DYNAMODB_RESOURCE.Table('FI_remediated')
    filter_key = 'project'
    filtering_exp = Key(filter_key).eq(project_name) & Key('remediated').eq(True)
    response = table.scan(FilterExpression=filtering_exp)
    items = response['Items']
    while response.get('LastEvaluatedKey'):
        response = table.scan(
            FilterExpression=filtering_exp,
            ExclusiveStartKey=response['LastEvaluatedKey'])
        items += response['Items']
    return items


def get_project_dynamo(project):
    """Get a project info."""
    filter_value = project.lower()
    table = DYNAMODB_RESOURCE.Table('FI_projects')
    filter_key = 'project_name'
    filtering_exp = Key(filter_key).eq(filter_value)
    response = table.query(KeyConditionExpression=filtering_exp)
    items = response['Items']
    while True:
        if response.get('LastEvaluatedKey'):
            response = table.query(
                KeyConditionExpression=filtering_exp,
                ExclusiveStartKey=response['LastEvaluatedKey'])
            items += response['Items']
        else:
            break
    return items


def add_project_dynamo(project, description, companies, project_type, status):
    """Add project to dynamo."""
    table = DYNAMODB_RESOURCE.Table('FI_projects')
    try:
        response = table.put_item(
            Item={
                'project_name': project.lower(),
                'description': description,
                'companies': companies,
                'type': project_type,
                'project_status': status
            }
        )
        resp = response['ResponseMetadata']['HTTPStatusCode'] == 200
        return resp
    except ClientError:
        rollbar.report_exc_info()
        return False


def add_release_to_project_dynamo(project_name, last_release):
    """Add or Update release status in a project."""
    table = DYNAMODB_RESOURCE.Table('FI_projects')
    item = get_project_dynamo(project_name)
    if item == []:
        try:
            response = table.put_item(
                Item={
                    'project_name': project_name.lower(),
                    'lastRelease': last_release
                }
            )
            resp = response['ResponseMetadata']['HTTPStatusCode'] == 200
            return resp
        except ClientError:
            rollbar.report_exc_info()
            return False
    else:
        try:
            response = table.update_item(
                Key={
                    'project_name': project_name.lower(),
                },
                UpdateExpression='SET lastRelease = :val1',
                ExpressionAttributeValues={
                    ':val1': last_release
                }
            )
            resp = response['ResponseMetadata']['HTTPStatusCode'] == 200
            return resp
        except ClientError:
            rollbar.report_exc_info()
            return False


def add_user_to_project_dynamo(project_name, user_email, role):
    """Adding user role in a project."""
    table = DYNAMODB_RESOURCE.Table('FI_projects')
    item = get_project_dynamo(project_name)
    if item == []:
        try:
            response = table.put_item(
                Item={
                    'project_name': project_name.lower(),
                    role: set([user_email])
                }
            )
            resp = response['ResponseMetadata']['HTTPStatusCode'] == 200
            return resp
        except ClientError:
            rollbar.report_exc_info()
            return False
    else:
        try:
            response = table.update_item(
                Key={
                    'project_name': project_name.lower(),
                },
                UpdateExpression='ADD #rol :val1',
                ExpressionAttributeNames={
                    '#rol': role
                },
                ExpressionAttributeValues={
                    ':val1': set([user_email])
                }
            )
            resp = response['ResponseMetadata']['HTTPStatusCode'] == 200
            return resp
        except ClientError:
            rollbar.report_exc_info()
            return False


def remove_role_to_project_dynamo(project_name, user_email, role):
    """Remove user role in a project."""
    table = DYNAMODB_RESOURCE.Table('FI_projects')
    try:
        response = table.update_item(
            Key={
                'project_name': project_name.lower(),
            },
            UpdateExpression='DELETE #rol :val1',
            ExpressionAttributeNames={
                '#rol': role
            },
            ExpressionAttributeValues={
                ':val1': set([user_email])
            }
        )
        resp = response['ResponseMetadata']['HTTPStatusCode'] == 200
        return resp
    except ClientError:
        rollbar.report_exc_info()
        return False


def delete_finding_dynamo(finding_id):
    """ Delete a finding in DynamoDb."""
    table = DYNAMODB_RESOURCE.Table('FI_findings')
    try:
        response = table.delete_item(
            Key={
                'finding_id': finding_id,
            }
        )
        resp = response['ResponseMetadata']['HTTPStatusCode'] == 200
        return resp
    except ClientError:
        rollbar.report_exc_info()
        return False


def get_toe_dynamo(project):
    """ Gets TOE of a proyect. """
    table = DYNAMODB_RESOURCE.Table('FI_toe')
    filter_key = 'project'
    filtering_exp = Key(filter_key).eq(project)
    response = table.query(KeyConditionExpression=filtering_exp)
    items = response['Items']
    while True:
        if response.get('LastEvaluatedKey'):
            response = table.query(
                KeyConditionExpression=filtering_exp,
                ExclusiveStartKey=response['LastEvaluatedKey'])
            items += response['Items']
        else:
            break
    return items


def weekly_report_dynamo(
        init_date, finish_date, registered_users, logged_users, companies):
    """ Save the number of registered and logged users weekly. """
    table = DYNAMODB_RESOURCE.Table('FI_weekly_report')
    try:
        response = table.put_item(
            Item={
                'init_date': init_date,
                'finish_date': finish_date,
                'registered_users': registered_users,
                'logged_users': logged_users,
                'companies': companies,
            }
        )
        resp = response['ResponseMetadata']['HTTPStatusCode'] == 200
        return resp
    except ClientError:
        rollbar.report_exc_info()
        return False


def get_project_access_dynamo(user_email, project_name):
    """Get user access of a project."""
    user_email = user_email.lower()
    project_name = project_name.lower()
    table = DYNAMODB_RESOURCE.Table('FI_project_access')
    filter_key = 'user_email'
    filter_sort = 'project_name'
    filtering_exp = Key(filter_key).eq(user_email) & \
        Key(filter_sort).eq(project_name)
    response = table.query(KeyConditionExpression=filtering_exp)
    items = response['Items']
    while True:
        if response.get('LastEvaluatedKey'):
            response = table.query(
                KeyConditionExpression=filtering_exp,
                ExclusiveStartKey=response['LastEvaluatedKey'])
            items += response['Items']
        else:
            break
    return items


def add_project_access_dynamo(
        user_email, project_name, project_attr, attr_value):
    """Add project access attribute."""
    table = DYNAMODB_RESOURCE.Table('FI_project_access')
    item = get_project_access_dynamo(user_email, project_name)
    if item == []:
        try:
            response = table.put_item(
                Item={
                    'user_email': user_email.lower(),
                    'project_name': project_name.lower(),
                    project_attr: attr_value
                }
            )
            resp = response['ResponseMetadata']['HTTPStatusCode'] == 200
            return resp
        except ClientError:
            rollbar.report_exc_info()
            return False
    else:
        return update_project_access_dynamo(
            user_email,
            project_name,
            project_attr,
            attr_value
        )


def remove_project_access_dynamo(user_email, project_name):
    """Remove project access in dynamo."""
    table = DYNAMODB_RESOURCE.Table('FI_project_access')
    try:
        response = table.delete_item(
            Key={
                'user_email': user_email.lower(),
                'project_name': project_name.lower(),
            }
        )
        resp = response['ResponseMetadata']['HTTPStatusCode'] == 200
        return resp
    except ClientError:
        rollbar.report_exc_info()
        return False


def update_project_access_dynamo(
        user_email, project_name, project_attr, attr_value):
    """Update project access attribute."""
    table = DYNAMODB_RESOURCE.Table('FI_project_access')
    try:
        response = table.update_item(
            Key={
                'user_email': user_email.lower(),
                'project_name': project_name.lower(),
            },
            UpdateExpression='SET #project_attr = :val1',
            ExpressionAttributeNames={
                '#project_attr': project_attr
            },
            ExpressionAttributeValues={
                ':val1': attr_value
            }
        )
        resp = response['ResponseMetadata']['HTTPStatusCode'] == 200
        return resp
    except ClientError:
        rollbar.report_exc_info()
        return False


def get_data_dynamo(table_name, primary_name_key, primary_key):
    """Get atributes data."""
    table = DYNAMODB_RESOURCE.Table(table_name)
    primary_key = primary_key.lower()
    filter_key = primary_name_key
    filtering_exp = Key(filter_key).eq(primary_key)
    response = table.query(KeyConditionExpression=filtering_exp)
    items = response['Items']
    while True:
        if response.get('LastEvaluatedKey'):
            response = table.query(
                KeyConditionExpression=filtering_exp,
                ExclusiveStartKey=response['LastEvaluatedKey'])
            items += response['Items']
        else:
            break
    return items


def add_list_resource_dynamo(
        table_name, primary_name_key, primary_key, data, attr_name):
    """Adding list attribute in a table."""
    table = DYNAMODB_RESOURCE.Table(table_name)
    item = get_data_dynamo(table_name, primary_name_key, primary_key)
    primary_key = primary_key.lower()
    if not item:
        try:
            response = table.put_item(
                Item={
                    primary_name_key: primary_key,
                    attr_name: data,
                }
            )
            resp = response['ResponseMetadata']['HTTPStatusCode'] == 200
            return resp
        except ClientError:
            rollbar.report_exc_info()
            return False
    else:
        primary_keys = [primary_name_key, primary_key]
        return update_list_resource_dynamo(
            table_name,
            primary_keys,
            data,
            attr_name,
            item
        )


def update_list_resource_dynamo(table_name, primary_keys, data, attr_name, item):
    """Update list attribute in a table."""
    table = DYNAMODB_RESOURCE.Table(table_name)
    try:
        if attr_name not in item[0]:
            table.update_item(
                Key={
                    primary_keys[0]: primary_keys[1],
                },
                UpdateExpression='SET #attrName = :val1',
                ExpressionAttributeNames={
                    '#attrName': attr_name
                },
                ExpressionAttributeValues={
                    ':val1': []
                }
            )
        update_response = table.update_item(
            Key={
                primary_keys[0]: primary_keys[1],
            },
            UpdateExpression='SET #attrName = list_append(#attrName, :val1)',
            ExpressionAttributeNames={
                '#attrName': attr_name
            },
            ExpressionAttributeValues={
                ':val1': data
            }
        )
        resp = update_response['ResponseMetadata']['HTTPStatusCode'] == 200
        return resp
    except ClientError:
        rollbar.report_exc_info()
        return False


def remove_list_resource_dynamo(
        table_name, primary_name_key, primary_key, attr_name, index):
    """Remove list attribute in a table."""
    table = DYNAMODB_RESOURCE.Table(table_name)
    try:
        response = table.update_item(
            Key={
                primary_name_key: primary_key.lower(),
            },
            UpdateExpression='REMOVE #attrName[' + str(index) + ']',
            ExpressionAttributeNames={
                '#attrName': attr_name
            }
        )
        resp = response['ResponseMetadata']['HTTPStatusCode'] == 200
        return resp
    except ClientError:
        rollbar.report_exc_info()
        return False


def add_attribute_dynamo(table_name, primary_keys, attr_name, attr_value):
    """Adding an attribute to a dynamo table."""
    table = DYNAMODB_RESOURCE.Table(table_name)
    item = get_data_dynamo(table_name, primary_keys[0], primary_keys[1])
    if not item:
        try:
            response = table.put_item(
                Item={
                    primary_keys[0]: primary_keys[1],
                    attr_name: attr_value
                }
            )
            resp = response['ResponseMetadata']['HTTPStatusCode'] == 200
            return resp
        except ClientError:
            rollbar.report_exc_info()
            return False
    else:
        return update_attribute_dynamo(
            table_name,
            primary_keys,
            attr_name,
            attr_value)


def update_attribute_dynamo(table_name, primary_keys, attr_name, attr_value):
    """Updating an attribute to a dynamo table."""
    table = DYNAMODB_RESOURCE.Table(table_name)
    try:
        response = table.update_item(
            Key={
                primary_keys[0]: primary_keys[1],
            },
            UpdateExpression='SET #attrName = :val1',
            ExpressionAttributeNames={
                '#attrName': attr_name
            },
            ExpressionAttributeValues={
                ':val1': attr_value
            }
        )
        resp = response['ResponseMetadata']['HTTPStatusCode'] == 200
        return resp
    except ClientError:
        rollbar.report_exc_info()
        return False


def update_in_multikey_table_dynamo(table_name, multiple_keys, attr_name, attr_value):
    table = DYNAMODB_RESOURCE.Table(table_name)
    try:
        update_response = table.update_item(
            Key=multiple_keys,
            UpdateExpression='SET #attrName = :val1',
            ExpressionAttributeNames={
                '#attrName': attr_name
            },
            ExpressionAttributeValues={
                ':val1': attr_value
            }
        )
        resp = update_response['ResponseMetadata']['HTTPStatusCode'] == 200
        return resp
    except ClientError:
        rollbar.report_exc_info()
        return False


def add_vulnerability_dynamo(table_name, data):
    """Add vulnerabilities."""
    table = DYNAMODB_RESOURCE.Table(table_name)
    try:
        response = table.put_item(
            Item={
                'finding_id': str(data["finding_id"]),
                'UUID': str(data["UUID"]),
                'vuln_type': data["vuln_type"],
                'where': data["where"],
                'specific': str(data["specific"]),
                'historic_state': data["historic_state"]
            }
        )
        resp = response['ResponseMetadata']['HTTPStatusCode'] == 200
        return resp
    except ClientError:
        rollbar.report_exc_info()
        return False


def get_vulnerabilities_dynamo(finding_id):
    """Get vulnerabilities of a finding."""
    table = DYNAMODB_RESOURCE.Table('FI_vulnerabilities')
    filter_key = 'finding_id'
    filtering_exp = Key(filter_key).eq(finding_id)
    response = table.query(KeyConditionExpression=filtering_exp)
    items = response['Items']
    while True:
        if response.get('LastEvaluatedKey'):
            response = table.query(
                KeyConditionExpression=filtering_exp,
                ExclusiveStartKey=response['LastEvaluatedKey'])
            items += response['Items']
        else:
            break
    return items


def get_vulnerability_dynamo(
        finding_id, vuln_type="", where="", specific="", uuid=""):
    """Get a vulnerability."""
    table = DYNAMODB_RESOURCE.Table('FI_vulnerabilities')
    hash_key = 'finding_id'
    if finding_id and uuid:
        range_key = 'UUID'
        key_exp = Key(hash_key).eq(finding_id) & Key(range_key).eq(uuid)
        response = table.query(KeyConditionExpression=key_exp)
    elif finding_id and vuln_type and where and specific:
        key_exp = Key(hash_key).eq(finding_id)
        filtering_exp = Attr("vuln_type").eq(vuln_type) & Attr("where").eq(where) \
            & Attr("specific").eq(str(specific))
        response = table.query(
            KeyConditionExpression=key_exp,
            FilterExpression=filtering_exp)
    else:
        response = table.query()
    items = response['Items']
    while True:
        if response.get('LastEvaluatedKey'):
            if filtering_exp:
                response = table.query(
                    KeyConditionExpression=key_exp,
                    FilterExpression=filtering_exp,
                    ExclusiveStartKey=response['LastEvaluatedKey'])
            else:
                response = table.query(
                    KeyConditionExpression=key_exp,
                    ExclusiveStartKey=response['LastEvaluatedKey'])
            items += response['Items']
        else:
            break
    return items


def update_state_dynamo(finding_id, vuln_id, attr_name, attr_value, item):
    table = DYNAMODB_RESOURCE.Table('FI_vulnerabilities')
    try:
        if attr_name not in item[0]:
            table.update_item(
                Key={
                    'finding_id': str(finding_id),
                    'UUID': vuln_id,
                },
                UpdateExpression='SET #attrName = :val1',
                ExpressionAttributeNames={
                    '#attrName': attr_name
                },
                ExpressionAttributeValues={
                    ':val1': []
                }
            )
        update_response = table.update_item(
            Key={
                'finding_id': str(finding_id),
                'UUID': vuln_id
            },
            UpdateExpression='SET #attrName = list_append(#attrName, :val1)',
            ExpressionAttributeNames={
                '#attrName': attr_name
            },
            ExpressionAttributeValues={
                ':val1': attr_value
            }
        )
        resp = update_response['ResponseMetadata']['HTTPStatusCode'] == 200
        return resp
    except ClientError:
        rollbar.report_exc_info()
        return False


def delete_vulnerability_dynamo(uuid, finding_id):
    """Delete a vulnerability of a finding."""
    table = DYNAMODB_RESOURCE.Table('FI_vulnerabilities')
    try:
        response = table.delete_item(
            Key={
                'UUID': uuid,
                'finding_id': finding_id
            }
        )
        resp = response['ResponseMetadata']['HTTPStatusCode'] == 200
        return resp
    except ClientError:
        rollbar.report_exc_info()
        return False


def get_finding_project(finding_id):
    """ Get project associated to a finding. """
    table = DYNAMODB_RESOURCE.Table('FI_findings')
    response = table.get_item(
        Key={
            'finding_id': finding_id
        },
        AttributesToGet=['project_name']
    )
    item = response.get('Item').get('project_name') if 'Item' in response else None

    return item


def add_multiple_attributes_dynamo(table_name, primary_keys, dic_data):
    """Adding multiple attributes to a dynamo table."""
    table = DYNAMODB_RESOURCE.Table(table_name)
    item = get_data_dynamo(table_name, primary_keys[0], primary_keys[1])
    keys_dic = {str(primary_keys[0]): primary_keys[1]}
    if item:
        resp = update_mult_attrs_dynamo(table_name, keys_dic, dic_data)
    else:
        try:
            dic_data_field = {k: dic_data[k] for k in dic_data.keys()}
            attr_to_add = forms.dict_concatenation(keys_dic, dic_data_field)
            response = table.put_item(
                Item=attr_to_add
            )
            resp = response['ResponseMetadata']['HTTPStatusCode'] == 200
        except ClientError:
            rollbar.report_exc_info()
            resp = False
    return resp


def update_mult_attrs_dynamo(table_name, primary_keys, dic_data):
    """Updating multiple data to a dynamo table."""
    table = DYNAMODB_RESOURCE.Table(table_name)
    try:
        str_format = '{metric} = :{metric}'
        empty_values = {k: v for k, v in dic_data.items() if v == ""}
        for item in empty_values:
            remove_attr_dynamo(table_name, primary_keys, item)
            del dic_data[item]

        dic_data_params = [str_format.format(metric=x) for x in dic_data.keys()]
        query_params = 'SET ' + ', '.join(dic_data_params)
        expression_params = {':' + k: dic_data[k] for k in dic_data.keys()}
        response = table.update_item(
            Key=primary_keys,
            UpdateExpression=query_params,
            ExpressionAttributeValues=expression_params
        )
        resp = response['ResponseMetadata']['HTTPStatusCode'] == 200
    except ClientError:
        rollbar.report_exc_info()
        resp = False
    return resp


def get_table_attributes_dynamo(table_name, primary_key, data_attributes):
    """ Get a group of attributes of a table. """
    table = DYNAMODB_RESOURCE.Table(table_name)
    try:
        response = table.get_item(
            Key=primary_key,
            AttributesToGet=data_attributes
        )
        items = response.get('Item')
    except ClientError:
        rollbar.report_exc_info()
        items = {}
    return items if items else {}


def get_finding_attributes_dynamo(finding_id, data_attributes):
    """ Get a group of attributes of a finding. """

    return get_table_attributes_dynamo(
        'FI_findings', {'finding_id': finding_id}, data_attributes)


def get_project_attributes_dynamo(project_name, data_attributes):
    """ Get a group of attributes of a project. """

    return get_table_attributes_dynamo(
        'FI_projects', {'project_name': project_name}, data_attributes)


def get_event_dynamo(event_id):
    """ Get an event. """
    table = DYNAMODB_RESOURCE.Table('fi_events')
    hash_key = 'event_id'
    key_exp = Key(hash_key).eq(event_id)
    response = table.query(KeyConditionExpression=key_exp)
    items = response['Items']
    while True:
        if response.get('LastEvaluatedKey'):
            response = table.query(
                KeyConditionExpression=key_exp,
                ExclusiveStartKey=response['LastEvaluatedKey'])
            items += response['Items']
        else:
            break
    return items


def get_event_attributes_dynamo(event_id, data_attributes):
    """ Get a group of attributes of a event. """
    table = DYNAMODB_RESOURCE.Table('fi_events')
    try:
        response = table.get_item(
            Key={
                'event_id': event_id
            },
            ProjectionExpression=data_attributes
        )
        items = response.get('Item')
    except ClientError:
        rollbar.report_exc_info()
        items = {}
    return items


def update_item_list_dynamo(
        primary_keys, attr_name, index, field, field_value):
    """update list attribute in a table."""
    table = DYNAMODB_RESOURCE.Table('FI_findings')
    try:
        response = table.update_item(
            Key={
                primary_keys[0]: primary_keys[1].lower(),
            },
            UpdateExpression='SET #attrName[' + str(index) + '].#field = :field_val',
            ExpressionAttributeNames={
                '#attrName': attr_name,
                '#field': field,
            },
            ExpressionAttributeValues={
                ':field_val': field_value
            }
        )
        resp = response['ResponseMetadata']['HTTPStatusCode'] == 200
        return resp
    except ClientError:
        rollbar.report_exc_info()
        return False


def get_findings_data_dynamo(filtering_exp, data_attr=''):
    """Get all the findings of a project."""
    table = DYNAMODB_RESOURCE.Table('FI_findings')
    if data_attr:
        response = table.scan(
            FilterExpression=filtering_exp,
            ProjectionExpression=data_attr)
        items = response['Items']
        while True:
            if response.get('LastEvaluatedKey'):
                response = table.scan(
                    FilterExpression=filtering_exp,
                    ProjectionExpression=data_attr,
                    ExclusiveStartKey=response['LastEvaluatedKey'])
                items += response['Items']
            else:
                break
    else:
        response = table.scan(
            FilterExpression=filtering_exp)
        items = response['Items']
        while response.get('LastEvaluatedKey'):
            response = table.scan(
                FilterExpression=filtering_exp,
                ExclusiveStartKey=response['LastEvaluatedKey'])
            items += response['Items']
    return items


def get_findings_dynamo(project, data_attr=''):
    """Get all the findings of a project."""
    project_name = project.lower()
    filter_key = 'project_name'
    filtering_exp = Attr(filter_key).eq(project_name)
    findings = get_findings_data_dynamo(filtering_exp, data_attr)
    return findings


def get_projects_data_dynamo(filtering_exp, data_attr=''):
    """Get project from Dynamodb"""
    table = DYNAMODB_RESOURCE.Table('FI_projects')
    if data_attr:
        response = table.scan(
            FilterExpression=filtering_exp,
            ProjectionExpression=data_attr)
        items = response['Items']
        while response.get('LastEvaluatedKey'):
            response = table.scan(
                FilterExpression=filtering_exp,
                ProjectionExpression=data_attr,
                ExclusiveStartKey=response['LastEvaluatedKey'])
            items += response['Items']

    else:
        response = table.scan(
            FilterExpression=filtering_exp)
        items = response['Items']
        while response.get('LastEvaluatedKey'):
            response = table.scan(
                FilterExpression=filtering_exp,
                ExclusiveStartKey=response['LastEvaluatedKey'])
            items += response['Items']
    return items


def get_findings_released_dynamo(project, data_attr=''):
    """Get all the findings that has been released."""
    filter_key = 'project_name'
    project_name = project.lower()
    filtering_exp = Attr(filter_key).eq(project_name) & Attr('releaseDate').exists()
    if data_attr and 'releaseDate' not in data_attr:
        data_attr += ', releaseDate'
    else:
        # By default it return all the attributes
        pass
    findings = get_findings_data_dynamo(filtering_exp, data_attr)
    findings_released = [i for i in findings if util.validate_release_date(i)]
    return findings_released


def get_events():
    """Get all the events."""
    filter_key = 'event_id'
    table = DYNAMODB_RESOURCE.Table('fi_events')
    filtering_exp = Attr(filter_key).exists()
    response = table.scan(FilterExpression=filtering_exp)
    items = response['Items']
    while True:
        if response.get('LastEvaluatedKey'):
            response = table.scan(
                FilterExpression=filtering_exp,
                ExclusiveStartKey=response['LastEvaluatedKey'])
            items += response['Items']
        else:
            break
    return items


def get_event_project(event_id):
    """Get project associated to a event."""
    table = DYNAMODB_RESOURCE.Table('fi_events')
    response = table.get_item(
        Key={
            'event_id': event_id
        },
        AttributesToGet=['project_name']
    )
    item = response.get('Item').get('project_name') if 'Item' in response else None

    return item


def remove_attr_dynamo(table_name, primary_keys, attr_name):
    """ Remove given attribute """

    table = DYNAMODB_RESOURCE.Table(table_name)
    try:
        response = table.update_item(
            Key=primary_keys,
            UpdateExpression='REMOVE #attrName',
            ExpressionAttributeNames={
                '#attrName': attr_name
            }
        )
        resp = response['ResponseMetadata']['HTTPStatusCode'] == 200
        return resp
    except ClientError:
        rollbar.report_exc_info()
        return False


def remove_set_element_dynamo(table_name, primary_keys, set_name, set_element):
    """Remove a element from a set."""
    table = DYNAMODB_RESOURCE.Table(table_name)
    try:
        response = table.update_item(
            Key={
                primary_keys[0]: primary_keys[1].lower(),
            },
            UpdateExpression='DELETE #name :val1',
            ExpressionAttributeNames={
                '#name': set_name
            },
            ExpressionAttributeValues={
                ':val1': set([set_element])
            }
        )
        resp = response['ResponseMetadata']['HTTPStatusCode'] == 200
    except ClientError:
        rollbar.report_exc_info()
        resp = False
    return resp


def add_set_element_dynamo(table_name, primary_keys, set_name, set_values):
    """Adding elements to a set."""
    table = DYNAMODB_RESOURCE.Table(table_name)
    item = get_data_dynamo(table_name, primary_keys[0], primary_keys[1])
    if item:
        resp = update_set_element_dynamo(
            table_name, primary_keys, set_name, set_values)
    else:
        try:
            response = table.put_item(
                Item={
                    primary_keys[0]: primary_keys[1].lower(),
                    set_name: set(set_values)
                }
            )
            resp = response['ResponseMetadata']['HTTPStatusCode'] == 200
        except ClientError:
            rollbar.report_exc_info()
            resp = False
    return resp


def update_set_element_dynamo(table_name, primary_keys, set_name, set_values):
    """Updating elements in a set."""
    table = DYNAMODB_RESOURCE.Table(table_name)
    try:
        response = table.update_item(
            Key={
                primary_keys[0]: primary_keys[1].lower(),
            },
            UpdateExpression='ADD #name :val1',
            ExpressionAttributeNames={
                '#name': set_name
            },
            ExpressionAttributeValues={
                ':val1': set(set_values)
            }
        )
        resp = response['ResponseMetadata']['HTTPStatusCode'] == 200
    except ClientError:
        rollbar.report_exc_info()
        resp = False
    return resp
