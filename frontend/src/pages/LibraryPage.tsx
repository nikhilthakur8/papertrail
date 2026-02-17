import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { papersAPI } from '@/lib/api';
import { RESEARCH_DOMAINS, READING_STAGES, IMPACT_SCORES, DATE_FILTERS } from '@/lib/constants';
import type { Paper } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import { 
  Library, 
  PlusCircle, 
  Filter, 
  Calendar, 
  Trash2, 
  BookOpen,
  X,
  Pencil
} from 'lucide-react';
import { format } from 'date-fns';

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

  const fetchPapers = async () => {
    setIsLoading(true);
    try {
      const filters: any = {
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
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch papers',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, [selectedStages, selectedDomains, selectedImpacts, dateFilter, currentPage, rowsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStages, selectedDomains, selectedImpacts, dateFilter, rowsPerPage]);

  const handleDelete = async (id: string) => {
    try {
      await papersAPI.delete(id);
      toast({
        title: 'Paper Deleted',
        description: 'The paper has been removed from your library',
      });
      setPapers(papers.filter(paper => paper._id !== id));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete paper',
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
        title: 'Paper Updated',
        description: 'Your changes have been saved',
      });
      setEditModalOpen(false);
      setEditingPaper(null);
      setPapers(papers.map(p => p._id === editingPaper._id ? editingPaper : p));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update paper',
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
        title: 'Mock Papers Added',
        description: response.data.message,
      });
      fetchPapers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to add mock papers',
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
      case 'High Impact': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Medium Impact': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      case 'Low Impact': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStageColor = (stage: string) => {
    const index = READING_STAGES.indexOf(stage as any);
    const colors = [
      'bg-rose-500/20 text-rose-400 border-rose-500/30',
      'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      'bg-sky-500/20 text-sky-400 border-sky-500/30',
      'bg-green-500/20 text-green-400 border-green-500/30',
      'bg-primary/20 text-primary border-primary/30',
    ];
    return colors[index] || colors[0];
  };

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2 sm:gap-3">
              <Library className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              Paper Library
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              {pagination.totalPapers} paper{pagination.totalPapers !== 1 ? 's' : ''} in your collection
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              className="sm:size-default"
              onClick={handleSeedMockPapers}
              disabled={isSeedingPapers}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              {isSeedingPapers ? 'Adding...' : 'Add Mock Papers'}
            </Button>
            <Link to="/add-paper">
              <Button size="sm" className="sm:size-default">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Paper
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFilterCount} active
                  </Badge>
                )}
              </CardTitle>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {/* Reading Stage Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-9">
                    Reading Stage
                    {selectedStages.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {selectedStages.length}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64">
                  <div className="space-y-2">
                    {READING_STAGES.map((stage) => (
                      <div key={stage} className="flex items-center space-x-2">
                        <Checkbox
                          id={`stage-${stage}`}
                          checked={selectedStages.includes(stage)}
                          onCheckedChange={() => toggleFilter(stage, selectedStages, setSelectedStages)}
                        />
                        <Label htmlFor={`stage-${stage}`} className="text-sm cursor-pointer">
                          {stage}
                        </Label>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Research Domain Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-9">
                    Research Domain
                    {selectedDomains.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {selectedDomains.length}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64">
                  <div className="space-y-2">
                    {RESEARCH_DOMAINS.map((domain) => (
                      <div key={domain} className="flex items-center space-x-2">
                        <Checkbox
                          id={`domain-${domain}`}
                          checked={selectedDomains.includes(domain)}
                          onCheckedChange={() => toggleFilter(domain, selectedDomains, setSelectedDomains)}
                        />
                        <Label htmlFor={`domain-${domain}`} className="text-sm cursor-pointer">
                          {domain}
                        </Label>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Impact Score Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-9">
                    Impact Score
                    {selectedImpacts.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {selectedImpacts.length}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64">
                  <div className="space-y-2">
                    {IMPACT_SCORES.map((impact) => (
                      <div key={impact} className="flex items-center space-x-2">
                        <Checkbox
                          id={`impact-${impact}`}
                          checked={selectedImpacts.includes(impact)}
                          onCheckedChange={() => toggleFilter(impact, selectedImpacts, setSelectedImpacts)}
                        />
                        <Label htmlFor={`impact-${impact}`} className="text-sm cursor-pointer">
                          {impact}
                        </Label>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Date Filter */}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-40 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DATE_FILTERS.map((filter) => (
                      <SelectItem key={filter.value} value={filter.value}>
                        {filter.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Papers Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Loading papers...</p>
              </div>
            ) : papers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground">No papers found</h3>
                <p className="text-muted-foreground mb-4">
                  {activeFilterCount > 0 
                    ? 'Try adjusting your filters or add new papers'
                    : 'Start by adding your first research paper'}
                </p>
                <Link to="/add-paper">
                  <Button>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Paper
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[250px]">Paper Title</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Domain</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead className="text-right">Citations</TableHead>
                        <TableHead>Impact</TableHead>
                        <TableHead>Date Added</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead className="w-[80px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {papers.map((paper) => (
                        <TableRow key={paper._id}>
                          <TableCell className="font-medium">
                            <span className="line-clamp-2">{paper.title}</span>
                          </TableCell>
                          <TableCell>{paper.firstAuthor}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{paper.researchDomain}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStageColor(paper.readingStage)}>
                              {paper.readingStage}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {paper.citationCount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge className={getImpactColor(paper.impactScore)}>
                              {paper.impactScore}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(paper.dateAdded), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(paper.updatedAt), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditClick(paper)}
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(paper._id)}
                                className="h-8 w-8 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-border">
                  {papers.map((paper) => (
                    <div key={paper._id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-foreground line-clamp-2 flex-1">
                          {paper.title}
                        </h3>
                        <div className="flex items-center shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(paper)}
                            className="h-8 w-8 text-muted-foreground"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(paper._id)}
                            className="h-8 w-8 text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{paper.firstAuthor}</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">{paper.researchDomain}</Badge>
                        <Badge className={`text-xs ${getStageColor(paper.readingStage)}`}>
                          {paper.readingStage}
                        </Badge>
                        <Badge className={`text-xs ${getImpactColor(paper.impactScore)}`}>
                          {paper.impactScore}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{paper.citationCount.toLocaleString()} citations</span>
                        <span>Added {format(new Date(paper.dateAdded), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>Rows per page:</span>
                    <Select value={rowsPerPage.toString()} onValueChange={(value) => setRowsPerPage(parseInt(value))}>
                      <SelectTrigger className="w-[70px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="hidden sm:inline">
                      Showing {((pagination.currentPage - 1) * pagination.limit) + 1}-{Math.min(pagination.currentPage * pagination.limit, pagination.totalPapers)} of {pagination.totalPapers}
                    </span>
                  </div>
                  
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => pagination.hasPrevPage && setCurrentPage(currentPage - 1)}
                          className={!pagination.hasPrevPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      
                      {/* First page */}
                      {pagination.totalPages > 0 && (
                        <PaginationItem>
                          <PaginationLink
                            onClick={() => setCurrentPage(1)}
                            isActive={currentPage === 1}
                            className="cursor-pointer"
                          >
                            1
                          </PaginationLink>
                        </PaginationItem>
                      )}
                      
                      {/* Ellipsis after first */}
                      {currentPage > 3 && pagination.totalPages > 4 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                      
                      {/* Middle pages */}
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                        .filter(page => page !== 1 && page !== pagination.totalPages && page >= currentPage - 1 && page <= currentPage + 1)
                        .map(page => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))
                      }
                      
                      {/* Ellipsis before last */}
                      {currentPage < pagination.totalPages - 2 && pagination.totalPages > 4 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                      
                      {/* Last page */}
                      {pagination.totalPages > 1 && (
                        <PaginationItem>
                          <PaginationLink
                            onClick={() => setCurrentPage(pagination.totalPages)}
                            isActive={currentPage === pagination.totalPages}
                            className="cursor-pointer"
                          >
                            {pagination.totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      )}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => pagination.hasNextPage && setCurrentPage(currentPage + 1)}
                          className={!pagination.hasNextPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Paper Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Paper</DialogTitle>
          </DialogHeader>
          {editingPaper && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Paper Title</Label>
                <Input
                  id="edit-title"
                  value={editingPaper.title}
                  onChange={(e) => setEditingPaper({ ...editingPaper, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-author">First Author</Label>
                <Input
                  id="edit-author"
                  value={editingPaper.firstAuthor}
                  onChange={(e) => setEditingPaper({ ...editingPaper, firstAuthor: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Research Domain</Label>
                  <Select
                    value={editingPaper.researchDomain}
                    onValueChange={(value) => setEditingPaper({ ...editingPaper, researchDomain: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RESEARCH_DOMAINS.map((domain) => (
                        <SelectItem key={domain} value={domain}>
                          {domain}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Reading Stage</Label>
                  <Select
                    value={editingPaper.readingStage}
                    onValueChange={(value) => setEditingPaper({ ...editingPaper, readingStage: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {READING_STAGES.map((stage) => (
                        <SelectItem key={stage} value={stage}>
                          {stage}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-citations">Citation Count</Label>
                  <Input
                    id="edit-citations"
                    type="number"
                    min="0"
                    value={editingPaper.citationCount}
                    onChange={(e) => setEditingPaper({ ...editingPaper, citationCount: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Impact Score</Label>
                  <Select
                    value={editingPaper.impactScore}
                    onValueChange={(value) => setEditingPaper({ ...editingPaper, impactScore: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {IMPACT_SCORES.map((impact) => (
                        <SelectItem key={impact} value={impact}>
                          {impact}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setEditModalOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleEditSave} disabled={isUpdating} className="w-full sm:w-auto">
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default LibraryPage;
