import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { papersAPI } from '@/lib/api';
import { RESEARCH_DOMAINS, READING_STAGES, IMPACT_SCORES, DATE_FILTERS } from '@/lib/constants';
import type { Paper } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useToast } from '@/components/ui/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Layout from '@/components/Layout';
import { 
  PlusCircle, 
  Filter, 
  Trash2, 
  BookOpen,
  X,
  Pencil,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalPapers: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const LibraryPage: React.FC = () => {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeedingPapers, setIsSeedingPapers] = useState(false);
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedImpacts, setSelectedImpacts] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState<string>('all_time');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPaper, setEditingPaper] = useState<Paper | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalPapers: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const { toast } = useToast();

  const fetchPapers = useCallback(async () => {
    setIsLoading(true);
    try {
      const filters: Record<string, string | number> = {
        page: currentPage,
        limit: rowsPerPage,
      };
      if (selectedStages.length > 0) filters.readingStage = selectedStages.join(',');
      if (selectedDomains.length > 0) filters.researchDomain = selectedDomains.join(',');
      if (selectedImpacts.length > 0) filters.impactScore = selectedImpacts.join(',');
      if (dateFilter && dateFilter !== 'all_time') filters.dateFilter = dateFilter;

      const response = await papersAPI.getAll(filters);
      setPapers(response.data.papers);
      setPagination(response.data.pagination);
    } catch (error: unknown) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to fetch papers.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, rowsPerPage, selectedStages, selectedDomains, selectedImpacts, dateFilter, toast]);

  useEffect(() => {
    fetchPapers();
  }, [fetchPapers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStages, selectedDomains, selectedImpacts, dateFilter, rowsPerPage]);

  const handleDelete = async (id: string) => {
    try {
      await papersAPI.delete(id);
      toast({
        title: 'Deleted',
        description: 'Paper removed from library.',
      });
      setPapers(papers.filter(paper => paper._id !== id));
    } catch (error: unknown) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to delete paper.',
        variant: 'destructive',
      });
    }
  };

  const handleEditClick = (paper: Paper) => {
    setEditingPaper({ ...paper });
    setEditModalOpen(true);
  };

  const handleEditSave = async () => {
    if (!editingPaper) return;
    setIsUpdating(true);
    try {
      await papersAPI.update(editingPaper._id, {
        title: editingPaper.title,
        firstAuthor: editingPaper.firstAuthor,
        researchDomain: editingPaper.researchDomain,
        readingStage: editingPaper.readingStage,
        citationCount: editingPaper.citationCount,
        impactScore: editingPaper.impactScore,
      });
      toast({
        title: 'Updated',
        description: 'Paper details saved.',
      });
      setEditModalOpen(false);
      setEditingPaper(null);
      setPapers(papers.map(p => p._id === editingPaper._id ? editingPaper : p));
    } catch (error: unknown) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to update paper.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSeedMockPapers = async () => {
    setIsSeedingPapers(true);
    try {
      const response = await papersAPI.seedMockPapers();
      toast({
        title: 'Success',
        description: response.data.message,
      });
      fetchPapers();
    } catch (error: unknown) {
      const err = error as any;
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to add mock papers.',
        variant: 'destructive',
      });
    } finally {
      setIsSeedingPapers(false);
    }
  };

  const toggleFilter = (
    value: string, 
    selected: string[], 
    setSelected: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (selected.includes(value)) {
      setSelected(selected.filter(item => item !== value));
    } else {
      setSelected([...selected, value]);
    }
  };

  const clearAllFilters = () => {
    setSelectedStages([]);
    setSelectedDomains([]);
    setSelectedImpacts([]);
    setDateFilter('all_time');
  };

  const activeFilterCount = selectedStages.length + selectedDomains.length + selectedImpacts.length + (dateFilter !== 'all_time' ? 1 : 0);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High Impact': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10 hover:bg-emerald-500/10';
      case 'Medium Impact': return 'bg-blue-500/10 text-blue-500 border-blue-500/10 hover:bg-blue-500/10';
      case 'Low Impact': return 'bg-zinc-800 text-zinc-400 border-zinc-800 hover:bg-zinc-800';
      default: return 'bg-zinc-900 text-zinc-500 border-zinc-900 hover:bg-zinc-900';
    }
  };

  const getStageColor = (stage: string) => {
    const index = READING_STAGES.indexOf(stage as any);
    const colors = [
      'bg-rose-500/10 text-rose-500 border-rose-500/10 hover:bg-rose-500/10',
      'bg-orange-500/10 text-orange-500 border-orange-500/10 hover:bg-orange-500/10',
      'bg-indigo-500/10 text-indigo-400 border-indigo-500/10 hover:bg-indigo-500/10',
      'bg-sky-500/10 text-sky-400 border-sky-500/10 hover:bg-sky-500/10',
      'bg-green-500/10 text-green-500 border-green-500/10 hover:bg-green-500/10',
      'bg-primary/10 text-primary border-primary/10 hover:bg-primary/10',
    ];
    return colors[index] || colors[0];
  };

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Paper Library</h1>
            <p className="text-zinc-500 mt-0.5 text-xs sm:text-sm">
              Currently tracking {pagination.totalPapers} research papers.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              size="sm"
              className="bg-zinc-900 border-zinc-800 text-sm sm:text-base font-medium rounded-lg px-4 h-10"
              onClick={handleSeedMockPapers}
              disabled={isSeedingPapers}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Add Mock Data
            </Button>
            <Link to="/add-paper">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm sm:text-base font-medium rounded-lg shadow-lg shadow-primary/10 px-4 h-10">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add New Paper
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter Strip */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-zinc-900/50 border border-zinc-800/50 rounded-xl overflow-x-auto whitespace-nowrap scrollbar-hide">
              <div className="flex items-center gap-2 px-3 mr-1">
                <Filter className="h-4 w-4 text-zinc-500" />
                <span className="text-sm sm:text-base font-medium text-zinc-500">Filters</span>
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-10 text-sm sm:text-base font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50">
                    Stage {selectedStages.length > 0 && <span className="ml-1 text-primary">({selectedStages.length})</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 bg-zinc-900 border-zinc-800 p-2 rounded-xl">
                  {READING_STAGES.map((stage) => (
                    <div key={stage} className="flex items-center gap-3 p-2 hover:bg-zinc-800 rounded-lg cursor-pointer" onClick={() => toggleFilter(stage, selectedStages, setSelectedStages)}>
                      <Checkbox checked={selectedStages.includes(stage)} className="border-zinc-700" />
                      <span className="text-sm sm:text-base text-zinc-300">{stage}</span>
                    </div>
                  ))}
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-10 text-sm sm:text-base font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50">
                    Domain {selectedDomains.length > 0 && <span className="ml-1 text-primary">({selectedDomains.length})</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 bg-zinc-900 border-zinc-800 p-2 rounded-xl">
                  {RESEARCH_DOMAINS.map((domain) => (
                    <div key={domain} className="flex items-center gap-3 p-2 hover:bg-zinc-800 rounded-lg cursor-pointer" onClick={() => toggleFilter(domain, selectedDomains, setSelectedDomains)}>
                      <Checkbox checked={selectedDomains.includes(domain)} className="border-zinc-700" />
                      <span className="text-sm sm:text-base text-zinc-300">{domain}</span>
                    </div>
                  ))}
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-10 text-sm sm:text-base font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50">
                    Impact {selectedImpacts.length > 0 && <span className="ml-1 text-primary">({selectedImpacts.length})</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 bg-zinc-900 border-zinc-800 p-2 rounded-xl">
                  {IMPACT_SCORES.map((impact) => (
                    <div key={impact} className="flex items-center gap-3 p-2 hover:bg-zinc-800 rounded-lg cursor-pointer" onClick={() => toggleFilter(impact, selectedImpacts, setSelectedImpacts)}>
                      <Checkbox checked={selectedImpacts.includes(impact)} className="border-zinc-700" />
                      <span className="text-sm sm:text-base text-zinc-300">{impact}</span>
                    </div>
                  ))}
                </PopoverContent>
              </Popover>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="h-10 w-40 bg-transparent border-none text-sm sm:text-base font-medium text-zinc-400 hover:text-white focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                  {DATE_FILTERS.map((f) => (
                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-10 text-sm sm:text-base text-zinc-500 hover:text-rose-500 font-medium px-3">
                  <X className="h-4 w-4 mr-1" /> Reset
                </Button>
              )}
        </div>

        {/* Papers List */}
        <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl overflow-hidden shadow-xl">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-80 space-y-4">
               <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
               <p className="text-sm sm:text-base text-zinc-500">Loading library...</p>
            </div>
          ) : papers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-80 text-center space-y-4">
               <div className="w-12 h-12 bg-zinc-800 flex items-center justify-center rounded-2xl">
                 <Search className="h-6 w-6 text-zinc-600" />
               </div>
               <p className="text-zinc-500 text-sm sm:text-base font-medium">No papers found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto whitespace-nowrap">
              <Table>
                <TableHeader className="bg-zinc-900/50">
                  <TableRow className="border-zinc-800/50 hover:bg-transparent">
                    <TableHead className="text-xs font-bold text-zinc-500 pl-6 h-10 w-[300px]">Paper Title</TableHead>
                    <TableHead className="text-xs font-bold text-zinc-500 h-10 w-[150px]">Author</TableHead>
                    <TableHead className="text-xs font-bold text-zinc-500 h-10 w-[150px]">Domain</TableHead>
                    <TableHead className="text-xs font-bold text-zinc-500 h-10 w-[150px]">Stage</TableHead>
                    <TableHead className="text-xs font-bold text-zinc-500 h-10 text-center w-[100px]">Citations</TableHead>
                    <TableHead className="text-xs font-bold text-zinc-500 h-10 text-center w-[120px]">Impact</TableHead>
                    <TableHead className="text-xs font-bold text-zinc-500 h-10 w-[120px]">Date Added</TableHead>
                    <TableHead className="text-xs font-bold text-zinc-500 h-10 w-[120px]">Last Updated</TableHead>
                    <TableHead className="text-xs font-bold text-zinc-500 text-right pr-6 h-10 w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {papers.map((paper) => (
                    <TableRow key={paper._id} className="border-zinc-800/30 group transition-colors hover:bg-transparent">
                      <TableCell className="pl-6 py-3">
                         <TooltipProvider>
                           <Tooltip>
                             <TooltipTrigger asChild>
                               <p className="text-sm font-bold text-zinc-200 truncate max-w-[300px] cursor-default">{paper.title}</p>
                             </TooltipTrigger>
                             <TooltipContent className="bg-zinc-900 border-zinc-800 text-zinc-200 max-w-[400px]">
                               <p>{paper.title}</p>
                             </TooltipContent>
                           </Tooltip>
                         </TooltipProvider>
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="text-xs sm:text-sm font-medium text-zinc-400 truncate block max-w-[150px]" title={paper.firstAuthor}>{paper.firstAuthor}</span>
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="text-xs sm:text-sm font-medium text-zinc-500 truncate block max-w-[150px]">{paper.researchDomain}</span>
                      </TableCell>
                      <TableCell className="py-3">
                         <Badge variant="outline" className={cn("text-[10px] sm:text-xs font-bold py-0.5 px-2 rounded-full whitespace-nowrap", getStageColor(paper.readingStage))}>
                           {paper.readingStage}
                         </Badge>
                      </TableCell>
                      <TableCell className="text-center py-3">
                        <span className="text-xs sm:text-sm font-bold text-zinc-200">{paper.citationCount}</span>
                      </TableCell>
                      <TableCell className="text-center py-3">
                         <Badge variant="outline" className={cn("text-[10px] sm:text-xs font-bold py-0.5 px-2 rounded-lg whitespace-nowrap", getImpactColor(paper.impactScore))}>
                           {paper.impactScore}
                         </Badge>
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="text-xs text-zinc-500 whitespace-nowrap">
                          {paper.dateAdded ? new Date(paper.dateAdded).toLocaleDateString() : '-'}
                        </span>
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="text-xs text-zinc-500 whitespace-nowrap">
                          {paper.updatedAt ? new Date(paper.updatedAt).toLocaleDateString() : '-'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-6 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEditClick(paper)} className="h-8 w-8 text-zinc-500 hover:text-primary">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(paper._id)} className="h-8 w-8 text-zinc-500 hover:text-rose-500">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Pagination */}
         <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-6 border-t border-zinc-800/30">
           <div className="flex items-center gap-4">
              <p className="text-sm sm:text-base font-medium text-zinc-500">Rows per page</p>
              <Select value={rowsPerPage.toString()} onValueChange={(v) => setRowsPerPage(parseInt(v) as any)}>
                <SelectTrigger className="h-10 w-20 bg-zinc-900/50 border-zinc-800 text-sm text-zinc-400 focus:ring-0 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-400">
                  <SelectItem value="10" className="text-sm sm:text-base">10</SelectItem>
                  <SelectItem value="25" className="text-sm sm:text-base">25</SelectItem>
                  <SelectItem value="50" className="text-sm sm:text-base">50</SelectItem>
                </SelectContent>
              </Select>
           </div>
           
           <Pagination>
             <PaginationContent className="gap-2">
               <PaginationItem>
                 <PaginationPrevious 
                   onClick={() => pagination.hasPrevPage && setCurrentPage(currentPage - 1)}
                   className={cn("text-sm font-bold h-10 px-4 rounded-xl border-zinc-800", !pagination.hasPrevPage && "opacity-20")}
                 />
               </PaginationItem>
               
               {[...Array(pagination.totalPages)].map((_, i) => (
                 <PaginationItem key={i} className="hidden sm:block">
                   <PaginationLink
                     onClick={() => setCurrentPage(i + 1)}
                     isActive={currentPage === (i + 1)}
                     className={cn("h-10 w-10 rounded-xl text-sm font-bold border-zinc-800", currentPage === (i + 1) ? "bg-primary text-primary-foreground border-primary" : "text-zinc-500 hover:text-white")}
                   >
                     {i + 1}
                   </PaginationLink>
                 </PaginationItem>
               ))}
 
               <PaginationItem>
                 <PaginationNext 
                   onClick={() => pagination.hasNextPage && setCurrentPage(currentPage + 1)}
                   className={cn("text-sm font-bold h-10 px-4 rounded-xl border-zinc-800", !pagination.hasNextPage && "opacity-20")}
                 />
               </PaginationItem>
             </PaginationContent>
           </Pagination>
        </div>
      </div>

      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-xl bg-zinc-900 border-zinc-800 rounded-2xl p-6 shadow-2xl">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-lg font-bold">Edit Paper</DialogTitle>
          </DialogHeader>
          {editingPaper && (
             <div className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label className="text-sm sm:text-base font-bold text-zinc-400 ml-1">Title</Label>
                <Input value={editingPaper.title} className="bg-zinc-950 border-zinc-800 h-12 rounded-xl text-sm sm:text-base text-zinc-200" onChange={(e) => setEditingPaper({ ...editingPaper, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <Label className="text-sm sm:text-base font-bold text-zinc-400 ml-1">Author</Label>
                   <Input value={editingPaper.firstAuthor} className="bg-zinc-950 border-zinc-800 h-12 rounded-xl text-sm sm:text-base text-zinc-200" onChange={(e) => setEditingPaper({ ...editingPaper, firstAuthor: e.target.value })} />
                </div>
                <div className="space-y-2">
                   <Label className="text-sm sm:text-base font-bold text-zinc-400 ml-1">Impact Score</Label>
                   <Select value={editingPaper.impactScore} onValueChange={(v) => setEditingPaper({ ...editingPaper, impactScore: v as any })}>
                      <SelectTrigger className="bg-zinc-950 border-zinc-800 h-12 rounded-xl text-sm sm:text-base text-zinc-200 outline-none">
                         <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                         {IMPACT_SCORES.map(s => <SelectItem key={s} value={s} className="text-sm sm:text-base">{s}</SelectItem>)}
                      </SelectContent>
                   </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-bold text-zinc-400 ml-1">Reading Stage</Label>
                    <Select value={editingPaper.readingStage} onValueChange={(v) => setEditingPaper({ ...editingPaper, readingStage: v as any })}>
                       <SelectTrigger className="bg-zinc-950 border-zinc-800 h-12 rounded-xl text-sm sm:text-base text-zinc-200 outline-none">
                          <SelectValue />
                       </SelectTrigger>
                       <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                          {READING_STAGES.map(s => <SelectItem key={s} value={s} className="text-sm sm:text-base">{s}</SelectItem>)}
                       </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-bold text-zinc-400 ml-1">Citations</Label>
                    <Input type="number" value={editingPaper.citationCount} className="bg-zinc-950 border-zinc-800 h-12 rounded-xl text-sm sm:text-base text-zinc-200" onChange={(e) => setEditingPaper({ ...editingPaper, citationCount: parseInt(e.target.value) || 0 })} />
                 </div>
              </div>
            </div>
          )}
          <DialogFooter className="mt-8 gap-4">
            <Button variant="ghost" onClick={() => setEditModalOpen(false)} className="flex-1 rounded-xl text-sm sm:text-base text-zinc-500 font-bold h-12">Cancel</Button>
            <Button onClick={handleEditSave} disabled={isUpdating} className="flex-1 rounded-xl bg-primary text-primary-foreground text-sm sm:text-base font-bold h-12 shadow-lg shadow-primary/10">{isUpdating ? 'Saving...' : 'Save Changes'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default LibraryPage;
