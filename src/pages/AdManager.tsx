import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Trash2, Plus } from 'lucide-react';

interface Ad {
  id: string;
  title: string;
  type: string;
  media_url: string;
  click_url?: string;
  placement: string;
  is_active: boolean;
}

const AdManager = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'banner',
    media_url: '',
    click_url: '',
    placement: 'top-banner',
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    fetchAds();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
    }
  };

  const fetchAds = async () => {
    try {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAds(data || []);
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('ads')
        .insert([{ ...formData, creator_id: user.id }]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Ad created successfully',
      });

      setFormData({
        title: '',
        type: 'banner',
        media_url: '',
        click_url: '',
        placement: 'top-banner',
      });
      setShowForm(false);
      fetchAds();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('ads')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      fetchAds();
    } catch (error) {
      console.error('Error updating ad:', error);
    }
  };

  const deleteAd = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ad?')) return;

    try {
      const { error } = await supabase
        .from('ads')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Ad deleted successfully',
      });
      fetchAds();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-3xl font-bold">Ad Manager</h1>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Ad
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create New Ad</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Ad Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="type">Ad Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="banner">Banner</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="square">Square</SelectItem>
                      <SelectItem value="skyscraper">Skyscraper</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="placement">Placement</Label>
                  <Select value={formData.placement} onValueChange={(value) => setFormData({ ...formData, placement: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top-banner">Top Banner</SelectItem>
                      <SelectItem value="bottom-banner">Bottom Banner</SelectItem>
                      <SelectItem value="left-skyscraper">Left Skyscraper</SelectItem>
                      <SelectItem value="right-square-1">Right Square 1</SelectItem>
                      <SelectItem value="right-square-2">Right Square 2</SelectItem>
                      <SelectItem value="right-video">Right Video</SelectItem>
                      <SelectItem value="middle-square">Middle Square</SelectItem>
                      <SelectItem value="post-results-video">Post Results Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="media_url">Media URL (Image or Video)</Label>
                  <Input
                    id="media_url"
                    type="url"
                    placeholder="https://example.com/image.jpg or video.mp4"
                    value={formData.media_url}
                    onChange={(e) => setFormData({ ...formData, media_url: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="click_url">Click URL (Optional)</Label>
                  <Input
                    id="click_url"
                    type="url"
                    placeholder="https://example.com/landing-page"
                    value={formData.click_url}
                    onChange={(e) => setFormData({ ...formData, click_url: e.target.value })}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit">Create Ad</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {isLoading ? (
            <p>Loading...</p>
          ) : ads.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No ads yet. Create your first ad to get started!
              </CardContent>
            </Card>
          ) : (
            ads.map((ad) => (
              <Card key={ad.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                      <div className="w-32 h-20 bg-muted rounded overflow-hidden flex-shrink-0">
                        {ad.media_url.match(/\.(mp4|webm|ogg)$/i) ? (
                          <video src={ad.media_url} className="w-full h-full object-cover" muted />
                        ) : (
                          <img src={ad.media_url} alt={ad.title} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{ad.title}</h3>
                        <div className="text-sm text-muted-foreground mt-1">
                          <p>Type: {ad.type} | Placement: {ad.placement}</p>
                          {ad.click_url && <p className="truncate">URL: {ad.click_url}</p>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`active-${ad.id}`} className="text-sm">Active</Label>
                        <Switch
                          id={`active-${ad.id}`}
                          checked={ad.is_active}
                          onCheckedChange={() => toggleActive(ad.id, ad.is_active)}
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => deleteAd(ad.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdManager;
