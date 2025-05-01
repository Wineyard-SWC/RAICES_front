
const parseFriendlyError = (error: string) => {
    if (!error) return null;
  
    const normalized = error.toLowerCase();
  
    if (normalized.includes('404')) {
      return 'The requested resource was not found. Please try again later.';
    }
  
    if (normalized.includes('fetch') || normalized.includes('network')) {
      return 'Unable to connect to the server. Please check your internet connection.';
    }
  
    if (normalized.includes('token expired')) {
      return 'Your session has expired. Please log in again.';
    }
  
    if (normalized.includes('token revoked')) {
      return 'Your session has expired. Please log in again.';
    }
  
    if (normalized.includes('invalid token')) {
      return 'Your session has expired. Please log in again.';
    }
  
    if (normalized.includes('missing token')) {
      return 'Your session has expired. Please log in again.';
    }
  
    if (normalized.includes('auth/wrong-password')) {
      return 'Incorrect email or password. Please try again.';
    }
  
    if (normalized.includes('user-not-found')) {
      return 'No user found with this email address.';
    }
  
    if (normalized.includes('auth/too-many-requests')) {
      return 'Too many failed attempts. Please wait before trying again.';
    }
  
    if (normalized.includes('auth/user-disabled')) {
      return 'This account has been disabled. Please contact support.';
    }

    if (normalized.includes('account-exists-with-different-credential')) {
      return 'This account has been assigned to another third party access method.';
    }
  
    return 'Unable to log in wrong mail or password. Please try again.';
  }

export default parseFriendlyError;