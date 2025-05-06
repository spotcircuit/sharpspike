
import React from 'react';
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { 
  Form, FormField, FormItem, FormLabel, 
  FormControl, FormDescription 
} from '@/components/ui/form';
import { UseFormReturn, useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TRACK_OPTIONS, JOB_TYPE_OPTIONS, INTERVAL_OPTIONS } from '@/types/ScraperTypes';

interface CreateJobDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  createJob: (values: any) => Promise<boolean>;
  form?: UseFormReturn<any>;
  onSubmit?: (values: any) => void;
}

const CreateJobDialog: React.FC<CreateJobDialogProps> = ({ 
  isOpen, 
  onOpenChange, 
  createJob,
  form: externalForm,
  onSubmit: externalOnSubmit
}) => {
  // Create an internal form if no external form is provided
  const internalForm = useForm({
    defaultValues: {
      url: '',
      track_name: '',
      job_type: 'odds',
      interval_seconds: 60,
      is_active: true
    }
  });

  // Use the external form if provided, otherwise use the internal form
  const form = externalForm || internalForm;

  // Define the internal submit handler
  const handleSubmit = async (values: any) => {
    const success = await createJob(values);
    if (success) {
      onOpenChange(false);
      form.reset();
    }
  };

  // Use the external onSubmit if provided, otherwise use the internal handleSubmit
  const onSubmit = externalOnSubmit || handleSubmit;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-betting-darkCard border-betting-mediumBlue text-white">
        <DialogHeader>
          <DialogTitle>Create New Scrape Job</DialogTitle>
          <DialogDescription>
            Configure a new job to automatically scrape data from offtrackbetting.com
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://www.offtrackbetting.com/..."
                      className="bg-betting-dark border-betting-mediumBlue text-white"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-gray-400">
                    The URL to scrape data from
                  </FormDescription>
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="track_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Track</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-betting-dark border-betting-mediumBlue text-white">
                          <SelectValue placeholder="Select track" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-betting-dark border-betting-mediumBlue text-white">
                        {TRACK_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="job_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-betting-dark border-betting-mediumBlue text-white">
                          <SelectValue placeholder="Select job type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-betting-dark border-betting-mediumBlue text-white">
                        {JOB_TYPE_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="interval_seconds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interval</FormLabel>
                    <Select 
                      onValueChange={(val) => field.onChange(parseInt(val))} 
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-betting-dark border-betting-mediumBlue text-white">
                          <SelectValue placeholder="Select interval" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-betting-dark border-betting-mediumBlue text-white">
                        {INTERVAL_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border border-betting-mediumBlue p-4 mt-6">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Active Job
                      </FormLabel>
                      <FormDescription className="text-gray-400">
                        Start scraping immediately
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-green-500"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter className="mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Job</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateJobDialog;
