const BRAND_PRIMARY = '#1C3828'
const BRAND_ACCENT = '#F4B534'
const BRAND_GREEN = '#587546'

export function emailWrapper(body: string): string {
  return `<div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb;">${body}</div>`
}

/** Header simple — usado en notificar-nuevo-reporte y notificar-error */
export function emailHeader(): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${BRAND_PRIMARY};">
      <tr>
        <td style="padding: 20px 28px;">
          <span style="color: #ffffff; font-size: 20px; font-weight: bold; font-family: Arial, sans-serif;">Koma<span style="color: ${BRAND_ACCENT};">Red</span></span>
          <span style="color: #9ca3af; font-size: 10px; letter-spacing: 2px; margin-left: 12px;">SISTEMA DE MONITOREO</span>
        </td>
      </tr>
    </table>`
}

/** Header con logo circular — usado en alertas-vencidas */
export function emailHeaderAlertas(): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${BRAND_PRIMARY};">
      <tr>
        <td style="padding: 20px 28px;">
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-right: 12px; vertical-align: middle;">
                <div style="width: 36px; height: 46px; position: relative; display: inline-block;">
                  <div style="width: 36px; height: 36px; background: ${BRAND_PRIMARY}; border-radius: 50%; border: 3px solid ${BRAND_ACCENT}; display: inline-block;"></div>
                </div>
              </td>
              <td style="vertical-align: middle;">
                <div style="color: #ffffff; font-size: 22px; font-weight: bold; line-height: 1;">Koma<span style="color: ${BRAND_ACCENT};">Red</span></div>
                <div style="color: #9ca3af; font-size: 9px; letter-spacing: 2px; margin-top: 3px;">VIGILANCIA CIUDADANA EN TORNO A LA ALIMENTACIÓN</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`
}

export function emailColorBar(height = 4): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="background: ${BRAND_GREEN}; height: ${height}px; width: 50%;"></td>
        <td style="background: ${BRAND_ACCENT}; height: ${height}px; width: 50%;"></td>
      </tr>
    </table>`
}

export function emailFooterDark(lines: string[]): string {
  const content = lines
    .map((l) => `<p style="margin: 0; color: #9ca3af; font-size: 11px;">${l}</p>`)
    .join('\n          ')
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="background: ${BRAND_PRIMARY};">
      <tr>
        <td style="padding: 14px 28px; text-align: center;">
          ${content}
        </td>
      </tr>
    </table>`
}
