import { SupabaseClient } from '@supabase/supabase-js'

export interface WebhookEventRecord {
  action: string | null
  eventType: string
  lastError?: string | null
  payload: unknown
  processedAt?: string | null
  provider: string
  providerEventId: string
  requestId: string | null
  resourceId: string
  status: 'ignored' | 'processing' | 'processed' | 'failed'
}

interface WebhookEventRow {
  status: WebhookEventRecord['status']
}

export class WebhookEventRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async isProcessed(provider: string, providerEventId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('webhook_events')
      .select('status')
      .eq('provider', provider)
      .eq('provider_event_id', providerEventId)
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    const row = data as WebhookEventRow | null
    return row?.status === 'processed' || row?.status === 'ignored'
  }

  async upsert(record: WebhookEventRecord): Promise<void> {
    const { error } = await this.supabase
      .from('webhook_events')
      .upsert({
        action: record.action,
        event_type: record.eventType,
        last_error: record.lastError ?? null,
        payload: record.payload,
        processed_at: record.processedAt ?? null,
        provider: record.provider,
        provider_event_id: record.providerEventId,
        request_id: record.requestId,
        resource_id: record.resourceId,
        status: record.status,
      }, {
        onConflict: 'provider,provider_event_id',
      })

    if (error) {
      throw new Error(error.message)
    }
  }
}
