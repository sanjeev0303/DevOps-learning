export const formatValidationError = (errors) => {
    if (!errors || !errors.issues) return "Validation Failed"

    if (Array.isArray(errors.issues)) {
        return errors.issues.map(issue => {
            const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
            return `${path}${issue.message}`;
        }).join(", ");
    }

    return JSON.stringify(errors)
}
