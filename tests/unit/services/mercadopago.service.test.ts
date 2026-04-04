import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MercadoPagoService } from '@/lib/services/mercadopago.service'
import { ProfileRepository } from '@/lib/repositories/profile.repository'
import { WebhookEventRepository } from '@/lib/repositories/webhook-event.repository'

describe('MercadoPagoService', () => {
  const profileRepository = {
    findById: vi.fn(),
    findByMpSubscriptionId: vi.fn(),
    releaseSubscriptionLock: vi.fn(),
    tryAcquireSubscriptionLock: vi.fn(),
    updateMpSubscriptionId: vi.fn(),
    updatePlan: vi.fn(),
  } as unknown as ProfileRepository

  const preApproval = {
    create: vi.fn(),
    get: vi.fn(),
  }

  const preApprovalPlan = {
    create: vi.fn(),
    search: vi.fn(),
  }

  const webhookEventRepository = {
    isProcessed: vi.fn(),
    upsert: vi.fn(),
  } as unknown as WebhookEventRepository

  let service: MercadoPagoService

  beforeEach(() => {
    vi.clearAllMocks()

    service = new MercadoPagoService(
      profileRepository,
      preApproval as never,
      preApprovalPlan as never,
      webhookEventRepository
    )
  })

  it('rebaixa o plano quando a assinatura expira', async () => {
    vi.mocked(webhookEventRepository.isProcessed).mockResolvedValue(false)
    vi.mocked(preApproval.get).mockResolvedValue({ status: 'expired' })
    vi.mocked(profileRepository.findByMpSubscriptionId).mockResolvedValue({
      id: 'user-1',
      mpSubscriptionId: 'sub-1',
      plan: 'paid',
    })

    await service.handleWebhook({
      eventId: 'event-1',
      payload: { id: 'event-1' },
      requestId: 'request-1',
      resourceId: 'sub-1',
      type: 'subscription_preapproval',
    })

    expect(profileRepository.updatePlan).toHaveBeenCalledWith('user-1', 'free')
  })

  it('promove o plano quando a assinatura fica autorizada', async () => {
    vi.mocked(webhookEventRepository.isProcessed).mockResolvedValue(false)
    vi.mocked(preApproval.get).mockResolvedValue({ status: 'authorized' })
    vi.mocked(profileRepository.findByMpSubscriptionId).mockResolvedValue({
      id: 'user-1',
      mpSubscriptionId: 'sub-1',
      plan: 'free',
    })

    await service.handleWebhook({
      eventId: 'event-2',
      payload: { id: 'event-2' },
      requestId: 'request-2',
      resourceId: 'sub-1',
      type: 'subscription_preapproval',
    })

    expect(profileRepository.updatePlan).toHaveBeenCalledWith('user-1', 'paid')
  })

  it('nao reutiliza assinatura pausada ao criar uma nova assinatura', async () => {
    vi.mocked(profileRepository.findById)
      .mockResolvedValueOnce({
        id: 'user-1',
        mpSubscriptionId: 'sub-paused',
        plan: 'free',
      })
      .mockResolvedValueOnce({
        id: 'user-1',
        mpSubscriptionId: 'sub-paused',
        plan: 'free',
      })
    vi.mocked(preApproval.get).mockResolvedValue({ id: 'sub-paused', status: 'paused' })
    vi.mocked(profileRepository.tryAcquireSubscriptionLock).mockResolvedValue(true)
    vi.mocked(preApprovalPlan.search).mockResolvedValue({
      results: [{ id: 'plan-1', reason: 'SpotLead - Plano Pro' }],
    })
    vi.mocked(preApproval.create).mockResolvedValue({
      id: 'sub-new',
      status: 'authorized',
    })

    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'

    const result = await service.createSubscription(
      'user-1',
      'user@example.com',
      { cardToken: 'card-token-123' }
    )

    expect(preApproval.create).toHaveBeenCalledOnce()
    expect(profileRepository.updateMpSubscriptionId).toHaveBeenCalledWith(
      'user-1',
      'sub-new'
    )
    expect(result).toEqual({
      subscriptionId: 'sub-new',
      status: 'authorized',
    })
  })
})
