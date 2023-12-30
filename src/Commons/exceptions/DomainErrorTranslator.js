const InvariantError = require('./InvariantError');

const DomainErrorTranslator = {
  translate(error) {
    return DomainErrorTranslator._directories[error.message] || error;
  },
};

DomainErrorTranslator._directories = {
  'REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada'),
  'REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat membuat user baru karena tipe data tidak sesuai'),

  'REGISTER_USER.USERNAME_LIMIT_CHAR': new InvariantError('tidak dapat membuat user baru karena karakter username melebihi batas limit'),
  'REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER': new InvariantError('tidak dapat membuat user baru karena username mengandung karakter terlarang'),

  'USER_LOGIN.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('harus mengirimkan username dan password'),
  'USER_LOGIN.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('username dan password harus string'),

  'REFRESH_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN': new InvariantError('harus mengirimkan token refresh'),
  'REFRESH_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('refresh token harus string'),

  'DELETE_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN': new InvariantError('harus mengirimkan token refresh'),
  'DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('refresh token harus string'),

  'NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('data properti thread tidak lengkap'),
  'NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tipe data thread tidak valid'),

  'ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('data properti pada thread yang ditambahkan tidak lengkap'),
  'ADDED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tipe data pada thread yang ditambahkan tidak valid'),

  'DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('data properti detail thread tidak lengkap'),
  'DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tipe data detail thread tidak valid'),

  'NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('data properti thread comment tidak lengkap'),
  'NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tipe data thread comment tidak valid'),

  'ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('data properti pada thread comment yang ditambahkan tidak lengkap'),
  'ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tipe data pada thread comment yang ditambahkan tidak valid'),

  'DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('data properti detail thread comment tidak lengkap'),
  'DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tipe data detail thread commment tidak valid'),

  'DELETE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('data properti delete thread comment tidak lengkap'),
  'DELETE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tipe data delete thread commment tidak valid'),
};

module.exports = DomainErrorTranslator;
