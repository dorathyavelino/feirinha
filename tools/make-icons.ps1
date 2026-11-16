# Gera os ícones do app: fundo verde com um "F" branco.
# Uso: powershell -File tools/make-icons.ps1
Add-Type -AssemblyName System.Drawing
$dir = Join-Path $PSScriptRoot '..\icons'
New-Item -ItemType Directory -Force $dir | Out-Null

foreach ($size in 180, 192, 512) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $g.TextRenderingHint = 'AntiAliasGridFit'
  $g.Clear([System.Drawing.ColorTranslator]::FromHtml('#2b7a4b'))
  $font = New-Object System.Drawing.Font 'Segoe UI', ([single]($size * 0.55)), ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
  $fmt = New-Object System.Drawing.StringFormat
  $fmt.Alignment = 'Center'
  $fmt.LineAlignment = 'Center'
  $rect = New-Object System.Drawing.RectangleF 0, ([single]($size * 0.03)), $size, $size
  $g.DrawString('F', $font, [System.Drawing.Brushes]::White, $rect, $fmt)
  $bmp.Save((Join-Path $dir "icon-$size.png"), [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
}
Write-Output 'Icones gerados.'
