export const roadmapPageStyles = {
  container: "min-h-screen bg-gray-50",
  canvasWrapper: "w-full max-w-7xl mx-auto p-6", 
  
  emptyStateWrapper: "max-w-7xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-8",
  emptyStateInner: "w-full mx-auto",
  
  headerSection: "text-center mb-10",
  iconWrapper: "inline-flex items-center justify-center w-16 h-16 bg-[#F5F0F5] rounded-lg mb-6",
  title: "text-3xl font-bold text-black mb-4",
  subtitle: "text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8",
  
  buttonRow: "flex flex-wrap justify-center gap-4 mb-10",
  button: "inline-flex items-center px-6 py-3 bg-[#4A2B4A] text-white rounded-lg hover:bg-[#3A1F3A] transition-colors duration-200 shadow-sm hover:shadow-md font-medium",
  secondaryButton: "inline-flex items-center px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-sm font-medium",
  suggestButton: "inline-flex items-center px-6 py-3 rounded-lg transition-colors duration-200 font-medium gap-2 shadow-sm",
  suggestButtonDisabled: "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200",
  suggestButtonEnabled: "bg-[#4A2B4A] text-white hover:bg-[#3A1F3A] border border-[#4A2B4A]",
  
  loadingContainer: "min-h-screen flex items-center justify-center bg-gray-50",
  loadingContent: "text-center",
  loadingSpinner: "animate-spin rounded-full h-12 w-12 border-3 border-gray-200 border-t-[#4A2B4A] mx-auto",
  loadingText: "mt-4 text-gray-600",
  
  contentGrid: "grid grid-cols-1 lg:grid-cols-5 gap-6 items-start",
  recentMapsSection: "lg:col-span-2 h-full", 
  suggestionsSection: "lg:col-span-3 h-full", 
  
  sectionCard: "bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col",
  sectionHeader: "bg-[#F5F0F5] px-6 py-4 border-b border-gray-200 flex-shrink-0",
  sectionHeaderAI: "bg-[#F5F0F1] px-6 py-4 border-b border-gray-200 flex-shrink-0",
  sectionHeaderTitle: "text-lg font-semibold text-[#4A2B4A] flex items-center gap-2",
  sectionHeaderTitleAI: "text-lg font-semibold text-[#4A2B4A] flex items-center gap-2",
  sectionContent: "p-6 flex-1 flex flex-col",
  
  emptyAIState: "text-center py-16 text-gray-500 flex-1 flex flex-col items-center justify-center",
  emptyAIIcon: "w-16 h-16 mx-auto mb-4 text-gray-300",
  emptyAITitle: "text-lg font-medium mb-2",
  emptyAISubtitle: "text-sm",
  
  TopBarWrapper: "fixed top-20 left-4 z-40 bg-white shadow-md rounded-lg px-4 py-2 text-[#4A2B4A] hover:bg-[#F5F0F5] transition-colors border border-gray-200",
  
  divider: "border-t border-gray-200 my-8",
  badge: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#4A2B4A] text-white",
  badgeAI: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#4A2B4A] text-white"
};