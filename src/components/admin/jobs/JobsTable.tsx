
import React from 'react';
import { ScrapeJob } from '@/types/ScraperTypes';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Loader2, Play, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface JobsTableProps {
  jobs: ScrapeJob[];
  onRunJob: (job: ScrapeJob) => void;
  onToggleJobStatus: (job: ScrapeJob) => void;
  onDeleteJob: (jobId: string) => void;
  isRunningJob: boolean;
  isLoading?: boolean;
}

const JobsTable: React.FC<JobsTableProps> = ({
  jobs,
  onRunJob,
  onToggleJobStatus,
  onDeleteJob,
  isRunningJob,
  isLoading
}) => {
  return (
    <div className="rounded-md border border-betting-mediumBlue overflow-hidden">
      <Table>
        <TableHeader className="bg-betting-darkPurple">
          <TableRow>
            <TableHead className="text-white">Track</TableHead>
            <TableHead className="text-white">Job Type</TableHead>
            <TableHead className="text-white">Status</TableHead>
            <TableHead className="text-white">Interval</TableHead>
            <TableHead className="text-white">Last Run</TableHead>
            <TableHead className="text-white">Next Run</TableHead>
            <TableHead className="text-white">Active</TableHead>
            <TableHead className="text-white text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-gray-400">
                No scrape jobs found. Create your first job to get started.
              </TableCell>
            </TableRow>
          ) : (
            jobs.map(job => (
              <TableRow key={job.id} className="hover:bg-betting-darkPurple/20">
                <TableCell className="font-medium">{job.track_name}</TableCell>
                <TableCell>
                  <span className="capitalize">{job.job_type.replace('_', ' ')}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      job.status === 'running' ? 'bg-blue-500' :
                      job.status === 'completed' ? 'bg-green-500' :
                      job.status === 'failed' ? 'bg-red-500' :
                      'bg-yellow-500'
                    }`}></span>
                    <span className="capitalize">{job.status}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {job.interval_seconds >= 60 
                    ? `${Math.floor(job.interval_seconds / 60)} min`
                    : `${job.interval_seconds} sec`}
                </TableCell>
                <TableCell>
                  {job.last_run_at 
                    ? format(parseISO(job.last_run_at), 'MM/dd HH:mm:ss')
                    : '-'}
                </TableCell>
                <TableCell>
                  {format(parseISO(job.next_run_at), 'MM/dd HH:mm:ss')}
                </TableCell>
                <TableCell>
                  <Switch 
                    checked={job.is_active}
                    onCheckedChange={() => onToggleJobStatus(job)}
                    className="data-[state=checked]:bg-green-500"
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRunJob(job)}
                      disabled={isRunningJob}
                      className="h-8 px-2 text-sm"
                    >
                      {isRunningJob ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDeleteJob(job.id)}
                      className="h-8 px-2 text-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default JobsTable;
