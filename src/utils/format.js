export const formatValidationErrors = (errors) => {
  if (!errors || !errors.issues) return 'validation failed';

  if (Array.isArray(errors.issues)) {
    return errors.issues.map(issue => ({
      field: issue.path.join(', '),
      message: issue.message,
    }));
  }

  return JSON.stringify(errors);
};