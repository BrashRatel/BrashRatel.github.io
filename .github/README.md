# Split⚡Tab

## Lightning-Powered Tool for Splitting Tabs and Invoicing Friends

Split🗲Tab is a simple web app designed to simplify the process of splitting bills and invoicing friends using Bitcoin Lightning.

## 🚀 Features

- **Easy Tab Splitting**: Enter items, quantities, and costs to split tabs effortlessly.
- **Flexible Item Management**: Rearrange items as needed for accurate bill distribution.
- **Lightning Network Integration**: Generate invoices directly through LNBits server integration.
- **Enhanced Interactivity**: Notice and animation when each invoice has been paid.
- **Customizable Settings**: Configure your own LNBits server and wallet information.

## 🛠️ Tech Stack

- HTML
- CSS
- JavaScript
- Bitcoin + Lightning + LNBits
- Github Pages

## 🔧 Setup and Config

1. **Quick Start**: Visit the [GitHub Page](https://split.r00t.co) instance to try Split🗲Tab with my LNBits server/wallet. 

>[!NOTE]
>Only test with small amounts to default instance, use info below if you'd like to use in production or contribute anything substantial.

2. **Change LNBits Config**:
   - Click the Bitcoin icon in the top left corner of the interface to modify LNBits URL/KEY information on-the-fly.

3. **Local Setup (Optional)**:
   - Clone or download a zip of this repository.
   - Host it locally on your preferred web server.
   - Update the LNBits information in `tab_split.js` to connect to your personal server and wallet by default.

## 🔒 Security

Your API key is stored only in client memory and is never transmitted back to GitHub, ensuring safe usage even when hosted online.

## 🤝 Contributing

Contributions welcome! If you have ideas for improvements or bug fixes, please feel free to submit a Pull Request.

## 🌟 Support the Project

If you find Split🗲Tab useful, consider sending a tip to the default wallet or use the other options below. Your support will aid in continued development and maintenance of this project.

Tips:
   - Lightning Address: `brash@pay.r00t.co` 
   - On-Chain Address: `bc1qk59sd56pwym6dexnw8rrfp3wl3433hm8dfm0uf` 

## 📝 Disclaimer

This project was developed with the assistance of Claude AI and represents an experimental approach to solving a common need. While functional, it may require further refinement and testing.

## 📄 License

[GNU General Public License v3.0](.githhub/LICENSE)

## 🔨 ToDo: ##
- [x] Drag and drop between tabs
- [x] Round grand total up/down to nearest dollar.
- [x] Poll LNBits server for USD/SAT exchange rate.
- [x] Poll LNBits for invoice in SATs.
- [x] Present QR code inline with each tab.
- [x] Add payment success notice and animation.
- [x] Make on-the-fly URL/KEY configuration changes.
- [x] Add html fields and functions to include sales tax.
- [x] Correct tax function issue - Currently must be applied before adding the tip or things get wonky.
- [ ] \(Possible) Look into adding sharing functions to send invoices once created.
- [ ] \(Possible) Find a better animation for completed payment.
- [ ] \(Possible) Look into adding OCR to import initial group tab via picture.

---

Created by a 🤖 and some help from [฿rash](https://github.com/BrashRatel) 
