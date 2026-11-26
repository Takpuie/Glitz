from wagtail import hooks


@hooks.register("insert_global_admin_css")
def global_admin_css():
    return """
    <style>
        body {
            background: linear-gradient(135deg, #f6f0e7 0%, #efe7da 100%);
        }

        .wagtail-logo {
            display: none;
        }

        .wrapper {
            background: rgba(255, 255, 255, 0.7);
            border: 1px solid rgba(21, 21, 21, 0.08);
            backdrop-filter: blur(8px);
        }

        .nav-tabs {
            border-bottom: 1px solid rgba(21, 21, 21, 0.08);
        }

        .button.button-primary,
        .button.button-long,
        .button {
            background: #1b1b1b;
            border-color: #1b1b1b;
        }

        .button.button-primary:hover,
        .button.button-long:hover,
        .button:hover {
            background: #3d2b1f;
            border-color: #3d2b1f;
        }

        .login-form {
            max-width: 420px;
            margin: 2rem auto 0;
            padding: 2rem 1.5rem;
            border-radius: 18px;
            background: rgba(255, 255, 255, 0.8);
            box-shadow: 0 18px 40px rgba(0, 0, 0, 0.08);
        }
    </style>
    """
