import { useState, useRef, useEffect } from "react";
import BacklogCard from "./productbacklog.backlogcard";
import { isUserStory, isBug } from "@/types/taskkanban";
import { TaskOrStory } from "@/types/taskkanban";
import { Input } from "@/components/ui/input";
import { Search, Bug, FileText, BookOpen, Filter } from "lucide-react";
import { Card } from "@/components/card";

interface ItemsUnderReviewProps {
  reviewItems: TaskOrStory[];
}

export const ItemsUnderReview: React.FC<ItemsUnderReviewProps> = ({ reviewItems }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleStartIndex, setVisibleStartIndex] = useState(0);
  const ESTIMATED_CARD_HEIGHT = 250; 

  const filteredItems = reviewItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType =
      typeFilter === "All" ||
      (typeFilter === "Bug" && isBug(item)) ||
      (typeFilter === "Task" && !isUserStory(item) && !isBug(item)) ||
      (typeFilter === "Story" && isUserStory(item));
    
    const matchesPriority =
      priorityFilter === "All" || item.priority?.toLowerCase() === priorityFilter.toLowerCase();
    
    return matchesSearch && matchesType && matchesPriority;
  });

  const handleScroll = () => {
    if (containerRef.current) {
      const scrollTop = containerRef.current.scrollTop;
      const newStartIndex = Math.floor(scrollTop / ESTIMATED_CARD_HEIGHT);
      setVisibleStartIndex(newStartIndex);
    }
  };

  const startIndex = currentPage * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredItems.length);
  const visibleItems = filteredItems.slice(startIndex, endIndex);

  const virtualStartIndex = Math.max(0, visibleStartIndex);
  const virtualEndIndex = Math.min(virtualStartIndex + itemsPerPage + 2, visibleItems.length); 
  const virtualVisibleItems = visibleItems.slice(virtualStartIndex, virtualEndIndex);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);


  return (
    <div className="mt-6">
      <Card className="border border-[#D3C7D3] shadow rounded-lg p-6">
        {/* Header con título y controles */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-black">Items Under Review</h2>
          
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            {/* Barra de búsqueda */}
            <div className="relative flex-grow md:flex-grow-0 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search items..."
                className="pl-10 h-10 bg-white w-full"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(0); // Reset to first page on search
                }}
              />
            </div>
            
            {/* Filtro por tipo */}
            <div className="relative min-w-[120px]">
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(0);
                }}
                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md appearance-none bg-white"
                aria-label="Filter by type"
              >
                <option value="All">All Types</option>
                <option value="Bug">Bugs</option>
                <option value="Task">Tasks</option>
                <option value="Story">Stories</option>
              </select>
              <Filter className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            
            {/* Filtro por prioridad */}
            <div className="relative min-w-[140px]">
              <select
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value);
                  setCurrentPage(0);
                }}
                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md appearance-none bg-white"
                aria-label="Filter by priority"
              >
                <option value="All">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <Filter className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            
            {/* Items por página */}
            <div className="flex items-center gap-2 min-w-[160px]">
              <span className="text-sm text-gray-700 whitespace-nowrap">Items per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(0);
                }}
                className="h-10 px-3 py-2 border border-gray-300 rounded-md"
                aria-label="Items per page"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Contador de resultados */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredItems.length > 0 ? startIndex + 1 : 0}-{endIndex} of {filteredItems.length} items
        </div>

        {/* Lista de elementos con virtualización */}
        <div 
          ref={containerRef}
          className="overflow-y-auto pr-1"
          style={{ height: `${Math.min(itemsPerPage * ESTIMATED_CARD_HEIGHT, 600)}px` }}
        >
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <FileText className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium">No items found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              {/* Espacio superior para elementos no visibles */}
              <div style={{ height: `${virtualStartIndex * ESTIMATED_CARD_HEIGHT}px` }} />
              
              {/* Elementos visibles */}
              {virtualVisibleItems.map((item) => (
                <BacklogCard
                  key={item.id}
                  id={item.id}
                  type={isUserStory(item) ? "STORY" : isBug(item) ? "BUG" : "TASK"}
                  priority={item.priority.toLowerCase()}
                  status={item.status_khanban!}
                  title={item.title}
                  description={item.description}
                  author={""}
                  reviewer={""}
                  progress={100}
                  comments={item.comments ?? []}
                />
              ))}
              
              <div style={{ 
                height: `${(visibleItems.length - virtualEndIndex) * ESTIMATED_CARD_HEIGHT}px` 
              }} />
            </>
          )}
        </div>

        {/* Paginación */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
            disabled={currentPage === 0}
            className="px-4 py-2 text-m rounded bg-[#4A2B4A] text-white disabled:bg-gray-300 transition-colors"
          >
            Previous
          </button>

          <div className="flex items-center gap-2">
            <span className="text-m text-black">
              Page {currentPage + 1} of {Math.max(1, Math.ceil(filteredItems.length / itemsPerPage))}
            </span>
            
            {/* Indicador de tipo de elementos */}
            <div className="hidden md:flex items-center gap-4 ml-6">
              <div className="flex items-center">
                <Bug className="h-4 w-4 mr-2 text-red-500" />
                <span className="text-sm">{filteredItems.filter(item => isBug(item)).length} Bugs</span>
              </div>
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2 text-blue-500" />
                <span className="text-sm">{filteredItems.filter(item => !isUserStory(item) && !isBug(item)).length} Tasks</span>
              </div>
              <div className="flex items-center">
                <BookOpen className="h-4 w-4 mr-2 text-green-500" />
                <span className="text-sm">{filteredItems.filter(item => isUserStory(item)).length} Stories</span>
              </div>
            </div>
          </div>

          <button
            onClick={() =>
              setCurrentPage((prev) =>
                (prev + 1) * itemsPerPage < filteredItems.length ? prev + 1 : prev
              )
            }
            disabled={(currentPage + 1) * itemsPerPage >= filteredItems.length}
            className="px-4 py-2 text-m rounded bg-[#4A2B4A] text-white disabled:bg-gray-300 transition-colors"
          >
            Next
          </button>
        </div>
      </Card>
    </div>
  );
};