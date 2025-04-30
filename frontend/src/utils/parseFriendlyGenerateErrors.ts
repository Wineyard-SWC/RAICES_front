const getUserFriendlyErrorMessage = (error: string): string => {
    if (!error) return '';
    
    if (error.includes('failed to fetch') || error.includes('network error')) {
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    }
    
    if (error.includes('404')) {
      return 'The requested information could not be found. Please try again later.';
    }
    
    if (error.includes('422') || error.includes('validation')) {
      return 'There was an issue with your request. Please check your input and try again.';
    }
    
    if (error.includes('500') || error.includes('internal server')) {
      return 'We\'re experiencing technical difficulties. Please try again later.';
    }
    
    if (error.includes('timeout')) {
      return 'The request took too long to process. Please try again later.';
    }
    
    if (error.includes('authorization') || error.includes('401') || error.includes('403')) {
      return 'You don\'t have permission to perform this action. Please log in again or contact support.';
    }
    
    return 'Something went wrong. Please try again later.';
};

export default getUserFriendlyErrorMessage;