
import { useEffect, useState } from 'react'
import { adminFetch } from './AdminLayout'

const emptyForm = {
  code: '',
  discountType: 'percentage',
  discountValue: '',
  minSubtotal: '0',
  expiryDate: '',
}

function AdminPromotions() {
  const [promotions, setPromotions] = useState([])
  const [formData, setFormData] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function loadPromotions() {
    setLoading(true)
    setError('')

    try {
      const data = await adminFetch('/api/admin/promotions')

      // The API is expected to return a list of promotions.
      setPromotions(Array.isArray(data) ? data : data.promotions || [])
    } catch (err) {
      setError(err.message || 'Could not load promotions.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPromotions()
  }, [])

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  function resetForm() {
    setFormData(emptyForm)
    setEditingId(null)
    setError('')
  }

  function handleEdit(promo) {
    setFormData({
      code: promo.code || '',
      discountType: promo.discount_type || promo.discountType || 'percentage',
      discountValue: String(promo.discount_value ?? promo.discountValue ?? ''),
      minSubtotal: String(promo.min_subtotal ?? promo.minSubtotal ?? 0),
      expiryDate: promo.expiry_date || promo.expiryDate || '',
    })

    setEditingId(promo.id)
    setError('')
    setSuccess('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (saving) return

    setSaving(true)
    setError('')
    setSuccess('')

    const payload = {
      code: formData.code.trim().toUpperCase(),
      discountType: formData.discountType,
      discountValue: Number(formData.discountValue),
      minSubtotal: Number(formData.minSubtotal),
      expiryDate: formData.expiryDate || null,
    }

    try {
      if (editingId !== null) {
        await adminFetch(`/api/admin/promotions/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })

        setSuccess('Promotion updated successfully.')
      } else {
        await adminFetch('/api/admin/promotions', {
          method: 'POST',
          body: JSON.stringify(payload),
        })

        setSuccess('Promotion created successfully.')
      }

      resetForm()
      await loadPromotions()
    } catch (err) {
      setError(err.message || 'Could not save the promotion.')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle(promo) {
    setError('')
    setSuccess('')

    try {
      await adminFetch(`/api/admin/promotions/${promo.id}/toggle`, {
        method: 'PATCH',
        body: JSON.stringify({}),
      })

      setSuccess('Promotion status updated.')
      await loadPromotions()
    } catch (err) {
      setError(err.message || 'Could not update promotion status.')
    }
  }

  function formatDiscount(promo) {
    const type = promo.discount_type || promo.discountType

    if (type === 'percentage') {
      return `${promo.discount_value ?? promo.discountValue}%`
    }

    return `NPR ${Number(
      promo.discount_value ?? promo.discountValue
    ).toLocaleString()}`
  }

  function isActive(promo) {
    return Boolean(promo.is_active ?? promo.isActive)
  }

  return (
    <section>
      <div className="admin-topbar">
        <div>
          <p className="admin-eyebrow">STORE MANAGEMENT</p>
          <h1>Promotions</h1>
          <p className="admin-content-muted">
            Create and manage discount codes for BOKYRA customers.
          </p>
        </div>
      </div>

      {error && <p className="admin-error">{error}</p>}

      {success && (
        <p className="admin-success">{success}</p>
      )}

      <div className="admin-panel admin-promo-form">
        <h2>{editingId !== null ? 'Edit Promotion' : 'Create Promotion'}</h2>

        <form onSubmit={handleSubmit}>
          <div className="admin-promo-grid">
            <label className="admin-field">
              Promo Code *
              <input
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="e.g. WELCOME10"
                minLength={3}
                maxLength={20}
                pattern="[A-Za-z0-9_-]+"
                required
              />
            </label>

            <label className="admin-field">
              Discount Type *
              <select
                name="discountType"
                value={formData.discountType}
                onChange={handleChange}
                required
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (NPR)</option>
              </select>
            </label>

            <label className="admin-field">
              Discount Value *
              <input
                type="number"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleChange}
                placeholder={
                  formData.discountType === 'percentage'
                    ? 'e.g. 10'
                    : 'e.g. 500'
                }
                min="0.01"
                max={formData.discountType === 'percentage' ? 100 : undefined}
                step="0.01"
                required
              />
            </label>

            <label className="admin-field">
              Minimum Subtotal (NPR)
              <input
                type="number"
                name="minSubtotal"
                value={formData.minSubtotal}
                onChange={handleChange}
                min="0"
                step="1"
                required
              />
            </label>

            <label className="admin-field">
              Expiry Date (Optional)
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
              />
            </label>
          </div>

          <div className="admin-actions admin-promo-form-actions">
            <button className="admin-button" type="submit" disabled={saving}>
              {saving
                ? 'Saving...'
                : editingId !== null
                  ? 'Update Promotion'
                  : 'Create Promotion'}
            </button>

            {editingId !== null && (
              <button
                className="admin-secondary-button"
                type="button"
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="admin-panel admin-promo-list">
        <h2>All Promotions</h2>

        {loading ? (
          <p className="admin-empty">Loading promotions...</p>
        ) : promotions.length === 0 ? (
          <p className="admin-empty">
            No promotions have been created yet.
          </p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Promo Code</th>
                  <th>Discount</th>
                  <th>Minimum Subtotal</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {promotions.map((promo) => (
                  <tr key={promo.id}>
                    <td><strong>{promo.code}</strong></td>
                    <td>{formatDiscount(promo)}</td>
                    <td>
                      NPR {Number(
                        promo.min_subtotal ?? promo.minSubtotal ?? 0
                      ).toLocaleString()}
                    </td>
                    <td>
                      {promo.expiry_date || promo.expiryDate || 'No expiry'}
                    </td>
                    <td>
                      <span className="admin-status">
                        {isActive(promo) ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button
                          type="button"
                          className="admin-text-button"
                          onClick={() => handleEdit(promo)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="admin-text-button"
                          onClick={() => handleToggle(promo)}
                        >
                          {isActive(promo) ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

export default AdminPromotions
