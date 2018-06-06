# pylint: disable=E0402
from ..dao import integrates_dao
from ..mailer import send_mail_new_user

FLUID_DOMAIN = '@fluidattacks.com'

# pylint: disable=W0613
def create_user(strategy, details, backend, user=None, *args, **kwargs):
    username = details['username'][:63]
    first_name = details['first_name'][:29]
    last_name = details['last_name'][:29]
    email = details['email']

    # Put details on session.
    strategy.session_set('first_name', first_name)
    strategy.session_set('last_name', last_name)

    if user:
        if integrates_dao.has_complete_data(user):
            integrates_dao.update_user_login_dao(user)
        else:
            integrates_dao.update_user_data(email, username, first_name,
                                           last_name)
            integrates_dao.update_user_login_dao(user)
    else:
        to = ["projects@fluidattacks.com", "production@fluidattacks.com",
              "technology@fluidattacks.com"]
        name = first_name + ' ' + last_name
        context = {
            'name_user': name,
            'mail_user': email,
            }
        send_mail_new_user(to, context)
        integrates_dao.create_user_dao(email, username=username,
                                       first_name=first_name,
                                       last_name=last_name)
    admin = ["jrestrepo@fluidattacks.com", "ralvarez@fluidattacks.com",
              "aroldan@fluidattacks.com", "cgomez@fluidattacks.com"]
    if email.endswith(FLUID_DOMAIN):
        integrates_dao.register(email)
        if email in admin:
            integrates_dao.assign_role(email, 'admin')
        else:
            integrates_dao.assign_role(email, 'analyst')
        integrates_dao.assign_company(email, 'FLUID')

def check_registered(strategy, details, backend, *args, **kwargs):
    email = details['email']
    is_registered = integrates_dao.is_registered_dao(email)
    last_login = integrates_dao.get_user_last_login_dao(email)
    role = integrates_dao.get_role_dao(email)
    company = integrates_dao.get_company_dao(email)

    strategy.session_set('username', email)
    strategy.session_set('registered', is_registered)
    strategy.session_set('role', role)
    strategy.session_set('company', company)
    strategy.session_set('last_login', last_login)
