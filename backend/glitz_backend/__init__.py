import pymysql

# Makes PyMySQL (pure-Python, no native compilation needed — chosen over
# mysqlclient specifically for TechNE's jailed shared hosting, where a
# C build toolchain isn't guaranteed) present itself as MySQLdb, which is
# what django.db.backends.mysql imports under the hood.
pymysql.install_as_MySQLdb()
