<?php
defined('BASEPATH') OR exit('No direct script access allowed');

$config = [
    'protocol'    => getenv('EMAIL_PROTOCOL') ?: 'smtp',
    'smtp_host'   => getenv('EMAIL_SMTP_HOST') ?: 'sandbox.smtp.mailtrap.io',
    'smtp_port'   => getenv('EMAIL_SMTP_PORT') ?: 2525,
    'smtp_user'   => getenv('EMAIL_SMTP_USER') ?: 'a3a39bba46c6ba',
    'smtp_pass'   => getenv('EMAIL_SMTP_PASS') ?: '78f3791d3630ab',
    'smtp_crypto' => getenv('EMAIL_SMTP_CRYPTO') ?: '',
    'mailtype'    => getenv('EMAIL_MAILTYPE') ?: 'html',
    'charset'     => getenv('EMAIL_CHARSET') ?: 'utf-8',
    'newline'     => "\r\n",
    'crlf'        => "\r\n"
];