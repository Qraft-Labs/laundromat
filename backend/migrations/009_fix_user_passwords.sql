-- Update admin and user passwords with correct bcrypt hashes
UPDATE users SET password = '$2a$10$Ps90zamj00N5HiG..G9Wr.CfkO7dUkFFcpncfmAORB5cVkcJOFWQ6' WHERE email = 'admin@lushlaundry.com';
UPDATE users SET password = '$2a$10$9gsp92gi9rfUTnShfzwnduUYHPIKQvLmrpnmqQ0SmLNjnJsQ2CA2i' WHERE email = 'user@lushlaundry.com';

-- Verify passwords
SELECT email, full_name, role, status, length(password) as pass_length FROM users WHERE email IN ('admin@lushlaundry.com', 'user@lushlaundry.com');
