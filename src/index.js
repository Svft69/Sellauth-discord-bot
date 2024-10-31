require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, EmbedBuilder } = require('discord.js');
const axios = require('axios');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

const SELL_AUTH_BASE_URL = 'https://api.sellauth.com/v1'; // Base URL for the SellAuth API

// Function to get the shop ID
function getShopId() {
  return 'yourshopid'; // Set your Shop ID here
}

// Function to create an embed
function createEmbed(title, description, fields = [], color = 0x0accc4) {
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .addFields(fields)
    .setColor(color)
    .setTimestamp();
  return embed;
}

// Function to fetch shop information from SellAuth API
async function getShopInfo() {
  const shopId = getShopId(); // Get the Shop ID here
  try {
    const response = await axios.get(`${SELL_AUTH_BASE_URL}/shops/${shopId}/`, {
      headers: {
        Authorization: `Bearer ${process.env.SELLAUTH_API_KEY}`,
      },
    });

    // Destructure the response data to exclude the 'terms'
    const { 
      terms, 
      stripe_api_key,
      stripe_webhook_secret,
      discord_webhook_url,
      discord_client_id,
      discord_client_secret,
      discord_bot_token,
      ...infoWithoutSensitiveData } = response.data;

    return infoWithoutSensitiveData; // Return the modified object without 'terms'
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.error('Shop not found:', error.response.data.message);
      return { error: 'Shop not found. Please check the shop ID and try again.' };
    } else {
      console.error('Error fetching shop info:', error);
      return { error: 'An error occurred while fetching shop information.' };
    }
  }
}

// Function to call the API for invoices
async function callApi(invoiceId) {
  const shopId = getShopId(); // Use the updated Shop ID
  const url = `${SELL_AUTH_BASE_URL}/shops/${shopId}/invoices/${invoiceId}`;
  console.log(`Requesting URL: ${url}`); // Log the URL for debugging

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.SELLAUTH_API_KEY}`,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error(`Error fetching data from API: ${error.response.data.message}`);
      return { error: `Error fetching invoice: ${error.response.data.message}` };
    } else {
      console.error('Error fetching data from API:', error);
      return { error: `Error fetching invoice: ${error.message}` };
    }
  }
}

// Function to fetch products from SellAuth API with pagination
async function getProducts(page = 1, limit = 10) {
  const shopId = getShopId(); // Use the updated Shop ID
  const url = `${SELL_AUTH_BASE_URL}/shops/${shopId}/products?page=${page}&limit=${limit}`;
  
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.SELLAUTH_API_KEY}`,
      },
    });
    return response.data; // Return the products data
  } catch (error) {
    if (error.response) {
      console.error(`Error fetching products: ${error.response.data.message}`);
      return { error: `Error fetching products: ${error.response.data.message}` };
    } else {
      console.error('Error fetching products:', error);
      return { error: `Error fetching products: ${error.message}` };
    }
  }
}

// Function to create a coupon
async function createCoupon(shopId, discount, code, global, type) {
  const url = `${SELL_AUTH_BASE_URL}/shops/${shopId}/coupons`;
  const payload = {
    discount,
    code,
    global,
    type,
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${process.env.SELLAUTH_API_KEY}`,
      },
    });
    return response.data;
  } catch (error) {
    if ( error.response) {
      console.error(`Error creating coupon: ${error.response.data.message}`);
      return { error: `Error creating coupon: ${error.response.data.message}` };
    } else {
      console.error('Error creating coupon:', error);
      return { error: `Error creating coupon: ${error.message}` };
    }
  }
}

// Function to delete a coupon
async function deleteCoupon(shopId, couponId) {
  const url = `${SELL_AUTH_BASE_URL}/shops/${shopId}/coupons/${couponId}`;

  try {
    const response = await axios.delete(url, {
      headers: {
        Authorization: `Bearer ${process.env.SELLAUTH_API_KEY}`,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error(`Error deleting coupon: ${error.response.data.message}`);
      return { error: `Error deleting coupon: ${error.response.data.message}` };
    } else {
      console.error('Error deleting coupon:', error);
      return { error: `Error deleting coupon: ${error.message}` };
    }
  }
}

// Function to delete a product
async function deleteProduct(shopId, productId) {
  const url = `${SELL_AUTH_BASE_URL}/shops/${shopId}/products/${productId}`;

  try {
    const response = await axios.delete(url, {
      headers: {
        Authorization: `Bearer ${process.env.SELLAUTH_API_KEY}`,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error(`Error deleting product: ${error.response.data.message}`);
      return { error: `Error deleting product: ${error.response.data.message}` };
    } else {
      console.error('Error deleting product:', error);
      return { error: `Error deleting product: ${error.message}` };
    }
  }
}

async function getGroup(shopId, groupId) {
  const url = `${SELL_AUTH_BASE_URL}/shops/${shopId}/groups/${groupId}`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.SELLAUTH_API_KEY}`,
      },
    });
    return response.data; // Return the specific group data
  } catch (error) {
    if (error.response) {
      console.error(`Error fetching group: ${error.response.data.message}`);
      return { error: `Error fetching group: ${error.response.data.message}` };
    } else {
      console.error('Error fetching group:', error);
      return { error: `Error fetching group: ${error.message}` };
    }
  }
}

async function getGroups(shopId) {
  const url = `${SELL_AUTH_BASE_URL}/shops/${shopId}/groups`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.SELLAUTH_API_KEY}`,
      },
    });
    return response.data; // Return the groups data
  } catch (error) {
    if (error.response) {
      console.error(`Error fetching groups: ${error.response.data.message}`);
      return { error: `Error fetching groups: ${error.response.data.message}` };
    } else {
      console.error('Error fetching groups:', error);
      return { error: `Error fetching groups: ${error.message}` };
    }
  }
}

async function getProductDetails(shopId, productId) {
  const url = `${SELL_AUTH_BASE_URL}/shops/${shopId}/products/${productId}`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.SELLAUTH_API_KEY}`,
      },
    });
    return response.data; // Return the product data
  } catch (error) {
    if (error.response) {
      console.error(`Error fetching product details: ${error.response.data.message}`);
      return null; // Return null if there was an error
    } else {
      console.error('Error fetching product details:', error);
      return null; // Return null if there was an error
    }
  }
}

// Function to fetch product details
async function getProductDetails(shopId, productId) {
  const url = `${SELL_AUTH_BASE_URL}/shops/${shopId}/products/${productId}`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.SELLAUTH_API_KEY}`,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error(`Error fetching product details: ${error.response.data.message}`);
      return null; // Return null if there was an error
    } else {
      console.error('Error fetching product details:', error);
      return null; // Return null if there was an error
    }
  }
}

async function getCoupons(shopId) {
  const url = `${SELL_AUTH_BASE_URL}/shops/${shopId }/coupons`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.SELLAUTH_API_KEY}`,
      },
    });
    return response.data; // Return the coupons data
  } catch (error) {
    if (error.response) {
      console.error(`Error fetching coupons: ${error.response.data.message}`);
      return { error: `Error fetching coupons: ${error.response.data.message}` };
    } else {
      console.error('Error fetching coupons:', error);
      return { error: `Error fetching coupons: ${error.message}` };
    }
  }
}

// Function to fetch payout balances
async function getPayoutBalances(shopId) {
  const url = `${SELL_AUTH_BASE_URL}/shops/${shopId}/payouts/balances`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.SELLAUTH_API_KEY}`,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error(`Error fetching payout balances: ${error.response.data.message}`);
      return { error: `Error fetching payout balances: ${error.response.data.message}` };
    } else {
      console.error('Error fetching payout balances:', error);
      return { error: `Error fetching payout balances: ${error.message}` };
    }
  }
}

// Function to edit a product's price
async function editProductPrice(shopId, productId, price) {
  const existingProduct = await getProductDetails(shopId, productId);

  if (!existingProduct) {
    return { error: 'Could not retrieve product details for the update.' };
  }

  const url = `${SELL_AUTH_BASE_URL}/shops/${shopId}/products/${productId}/update`;

  // Prepare payload with existing details and new price
  const payload = {
    price,
    name: existingProduct.name, // Keeping existing name
    description: existingProduct.description, // Keeping existing description
    currency: existingProduct.currency, // Keeping Existing Currency
    type: existingProduct.type, // Keeping Existing Type
    visibility: existingProduct.visibility, // Keeping Existing Visibility
    // Add any other fields you might need to keep
  };

  try {
    const response = await axios.put(url, payload, {
      headers: {
        Authorization: `Bearer ${process.env.SELLAUTH_API_KEY}`,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error(`Error updating product price: ${error.response.data.message}`);
      return { error: `Error updating product price: ${error.response.data.message}` };
    } else {
      console.error('Error updating product price:', error);
      return { error: `Error updating product price: ${error.message}` };
    }
  }
}

// Register Slash Commands
const commands = [
  {
    name: 'getinvoice',
    description: 'Fetch an invoice by ID',
    options: [
      {
        name: 'invoice_id',
        type: 3, // Type 3 is for STRING
        description: 'The ID of the invoice',
        required: true,
      },
    ],
  },
  {
    name: 'shopinfo',
    description: 'Get information about the shop',
  },
  {
    name: 'balances',
    description: 'Get the payout balances for the shop',
  },
  {
    name: 'groups',
    description: 'Fetch and display the list of groups for the shop',
  },
  {
    name: 'coupons',
    description: 'Fetch and display the list of coupons for the shop',
  },
  {
    name: 'claimrole',
    description: 'Claim Customer role',
    options: [
      {
        name: 'order_id',
        type: 3, // Type 3 is for STRING
        description: 'The ID of the order',
        required: true,
      },
    ],
  },
  {
    name: 'deletecoupon',
    description: 'Delete a coupon by ID',
    options: [
        {
            name: 'coupon_id',
            type: 3, // Type 3 is for STRING
            description: 'The ID of the coupon to delete',
            required: true,
        },
    ],
},
  {
    name: 'products',
    description: 'Fetch products with pagination',
    options: [
      {
        name: 'page',
        type: 4, // Type 4 is for INTEGER
        description: 'Page number of products to fetch',
        required: false,
      },
    ],
  },
  {
    name: 'product',
    description: 'Fetch a specific product by ID',
    options: [
      {
        name: 'product_id',
        type: 3, // Type 3 is for STRING
        description: 'The ID of the product to fetch',
        required : true,
      },
    ],
  },
  {
    name: 'group',
    description: 'Fetch a specific group by ID',
    options: [
      {
        name: 'group_id',
        type: 3, // Type 3 is for STRING
        description: 'The ID of the group',
        required: true,
      },
    ],
  },
  {
    name: 'createcoupon',
    description: 'Create a new coupon',
    options: [
      { name: 'shop_id', type: 3, description: 'Shop ID', required: true }, // Required
      { name: 'code', type: 3, description: 'Coupon code', required: true }, // Required
      { name: 'discount', type: 4, description: 'Discount amount', required: true }, // Required
      { name: 'type', type: 3, description: 'Coupon type', required: true }, // Required
      { name: 'global', type: 5, description: 'Is the coupon global?', required: false }, // Non-required
    ],
  },
];

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands,
    });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

client.once('ready', () => {
  console.log('Bot is online!');
});

// Event handler for interactions
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'getinvoice') {
    const invoiceId = interaction.options.getString('invoice_id');

    try {
        // Defer the reply to allow time for the API call
        await interaction.deferReply();

        // Call the API to get the invoice data
        const invoiceData = await callApi(invoiceId);

        // Check if the invoice data was retrieved successfully
        if (!invoiceData) {
            return await interaction.editReply({ 
                content: '❌ Invoice not found. Please check the ID and try again.', 
                ephemeral: true 
            });
        }

        // Create an embed for the invoice details
        const embed = createInvoiceEmbed(invoiceData);

        // Reply with the embed
        await interaction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error('Error fetching invoice:', error);
        await interaction.editReply({ 
            content: '❌ There was an error retrieving the invoice. Please try again later.', 
            ephemeral: true 
        });
    }
}

// Function to create a detailed invoice embed
function createInvoiceEmbed(invoice) {
    const embed = new EmbedBuilder()
        .setTitle('Invoice Details')
        .setColor('#0accc4') // Your preferred color
        .setTimestamp();

    // Grouping related fields
    embed.addFields(
        { name: 'Invoice Information', value: `**Invoice ID:** ${invoice.id}\n` +
            `**Coupon ID:** ${invoice.coupon_id ? invoice.coupon_id : 'N/A'}\n` +
            `**PayPal Email:** ${invoice.paypalff_email || 'N/A'}\n` +
            `**Customer ID:** ${invoice.customer_id}\n` +
            `**Email:** ${invoice.email || 'N/A'}`, inline: false },
        
        { name: 'Pricing Details', value: `**Price:** ${invoice.price} ${invoice.currency}\n` +
            `**Amount:** ${invoice.amount}\n` +
            `**Price (USD):** ${invoice.price_usd} USD\n` +
            `**Price (EUR):** ${invoice.price_eur} EUR`, inline: false },

        { name: 'Transaction Status', value: `**Status:** ${capitalizeFirstLetter(invoice.status)}\n` +
            `**Payment Gateway:** ${invoice.gateway}\n` +
            `**Created At:** ${new Date(invoice.created_at).toLocaleString()}\n` +
            `**Updated At:** ${new Date(invoice.updated_at).toLocaleString()}\n` +
            `**Completed At:** ${invoice.completed_at ? new Date(invoice.completed_at).toLocaleString() : 'N/A'}`, inline: false },

        { name: 'Security & User Info', value: `**Salt:** ${invoice.salt || 'N/A'}\n` +
            `**IP Address:** ${invoice.ip || 'N/A'}\n` +
            `**User Agent:** ${invoice.user_agent || 'N/A'}\n` +
            `**Discord User ID:** ${invoice.discord_user_id || 'N/A'}`, inline: false },

        { name: 'Payment & Delivery', value: `**Transaction ID:** ${invoice.paypalff_transaction_id || 'N/A'}\n` +
            `**Delivered:** ${invoice.delivered || 'N/A'}\n` +
            `**CashApp Email:** ${invoice.cashapp_email || 'N/A'}\n` +
            `**CashApp Cashtag:** ${invoice.cashapp_cashtag || 'N/A'}\n` +
            `**Venmo Tag:** ${invoice.venmo_tag || 'N/A'}`, inline: false },

        { name: 'Product Details', value: `**Product ID:** ${invoice.product_id}\n` +
            `**Product Name:** ${invoice.product?.name || 'N/A'}\n` +
            `**Variant ID:** ${invoice.variant_id}\n` +
            `**Variant Name:** ${invoice.variant?.name || 'N/A'}\n` +
            `**Stock Count:** ${invoice.product?.stock_count || 'N/A'}`, inline: false },

        { name: 'Additional Info', value: `**Unique ID:** ${invoice.unique_id || 'N/A'}\n` +
            `**Archived:** ${invoice.archived}\n` +
            `**Manual:** ${invoice.manual}\n` +
            `**Custom Fields:** ${invoice.custom_fields.length > 0 ? invoice.custom_fields.join(', ') : 'None'}`, inline: false },

        { name: 'Crypto Info', value: `**Crypto Address:** ${invoice.crypto_address || 'N/A'}\n` +
            `**Crypto Amount:** ${invoice.crypto_amount ? invoice.crypto_amount.toString() : 'N/A'}`, inline: false },

        { name: 'Other Transactions', value: `**PayPal Note:** ${invoice.paypalff_note || 'N/A'}\n` +
            `**PayPal Currency:** ${invoice.paypalff_currency || 'N/A'}\n` +
            `**Stripe PI ID:** ${invoice.stripe_pi_id || 'N/A'}\n` +
            `**Mollie Transaction ID:** ${invoice.mollie_transaction_id || 'N/A'}\n` +
            `**Skrill Transaction ID:** ${invoice.skrill_transaction_id || 'N/A'}`, inline: false }
    );

    return embed;
}
 if (commandName === 'groups') {
  const shopId = getShopId(); // Set the Shop ID here
  const groupsResponse = await getGroups(shopId);

  // Check if there was an error in fetching groups
  if (groupsResponse.error) {
    return await interaction.reply({ content: groupsResponse.error, ephemeral: true });
  }

  // Ensure that groupsResponse contains a valid array
  if (!Array.isArray(groupsResponse)) {
    return await interaction.reply({ content: 'No groups found or invalid response structure.', ephemeral: true });
  }

  const fields = groupsResponse.map(group => {
    return {
      name: `**\`${group.name || 'Unnamed Group'}\`**`, // Make the group name stand out
      value: `**ID:** ${group.id}\n` +
             `**Product Count:** ${group.products_count || '0'}\n` +
             `**Created At:** ${new Date(group.created_at).toLocaleString()}`,
    };
  })

  const embed = createEmbed('Groups', 'Here are the available groups:', fields);
  await interaction.reply({ embeds: [embed] });
}
 if (commandName === 'coupons') {
  const shopId = getShopId(); // Set the Shop ID here
  const couponsResponse = await getCoupons(shopId);

  // Check if there was an error in fetching coupons
  if (couponsResponse.error) {
    return await interaction.reply({ content: couponsResponse.error, ephemeral: true });
  }

  // Ensure that couponsResponse contains a valid array
  if (!Array.isArray(couponsResponse)) {
    return await interaction.reply({ content: 'No coupons found or invalid response structure.', ephemeral: true });
  }

  const fields = couponsResponse.map(coupon => {
    return {
      name: `**\`${coupon.code || 'Unnamed Coupon'}\`**`, // Make the coupon name stand out
      value: `**ID:** ${coupon.id}\n` + // Add coupon ID
             `**Discount:** ${coupon.discount}%\n` +
             `**Type:** ${coupon.type}\n` +
             `**Global:** ${coupon.global ? "Yes" : "No"}`,
    };
  });

  const embed = createEmbed('Coupons', 'Here are the available coupons:', fields);
  await interaction.reply({ embeds: [embed] });
}

// Utility function to capitalize the first letter of a string
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


// Utility function to capitalize the first letter of a string
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);

  }  if (commandName === 'shopinfo') {
    const shopInfo = await getShopInfo();

    // Check for errors in the shopInfo
    if (shopInfo.error) {
        return await interaction.reply({ content: shopInfo.error, ephemeral: true });
    }

    // Define embed groups for readability
    const embeds = [
        new EmbedBuilder()
            .setTitle("Shop Information - Basic Info")
            .setColor("#0accc4")
            .addFields(
                { name: 'Shop ID', value: `${shopInfo.id}`, inline: true },
                { name: 'Name', value: `${shopInfo.name}`, inline: true },
                { name: 'Subdomain', value: `${shopInfo.subdomain}`, inline: true },
                { name: 'Created At', value: `${shopInfo.created_at}`, inline: true },
                { name: 'Updated At', value: `${shopInfo.updated_at}`, inline: true },
                { name: 'Owner ID', value: `${shopInfo.owner_id}`, inline: true },
                { name: 'URL', value: shopInfo.url || 'N/A', inline: true }
            ),

        new EmbedBuilder()
            .setTitle("Shop Information - Images & URLs")
            .setColor("#0accc4")
            .addFields(
                { name: 'Logo Image ID', value: `${shopInfo.logo_image_id}`, inline: true },
                { name: 'Favicon Image ID', value: `${shopInfo.favicon_image_id}`, inline: true },
                { name: 'Image URL', value: shopInfo.image_url || 'N/A', inline: true },
                { name: 'Background Image URL', value: shopInfo.background_image_url || 'N/A', inline: true },
                { name: 'Discord URL', value: shopInfo.discord_url || 'N/A', inline: true },
                { name: 'YouTube URL', value: shopInfo.youtube_url || 'N/A', inline: true },
                { name: 'Telegram URL', value: shopInfo.telegram_url || 'N/A', inline: true },
                { name: 'TikTok URL', value: shopInfo.tiktok_url || 'N/A', inline: true },
                { name: 'Instagram URL', value: shopInfo.instagram_url || 'N/A', inline: true }
            ),

        new EmbedBuilder()
            .setTitle("Shop Information - Bitcoin & Litecoin Details")
            .setColor("#0accc4")
            .addFields(
                { name: 'Bitcoin Address', value: shopInfo.bitcoin_address || 'N/A', inline: true },
                { name: 'Bitcoin Wallet', value: shopInfo.bitcoin_wallet || 'N/A', inline: true },
                { name: 'Bitcoin Last Processed Block', value: `${shopInfo.bitcoin_last_processed_block}`, inline: true },
                { name: 'Litecoin Address', value: shopInfo.litecoin_address || 'N/A', inline: true },
                { name: 'Litecoin Wallet', value: shopInfo.litecoin_wallet || 'N/A', inline: true },
                { name: 'Litecoin Last Processed Block', value: `${shopInfo.litecoin_last_processed_block}`, inline: true }
            ),

        new EmbedBuilder()
            .setTitle("Shop Information - PayPal & Payment Details")
            .setColor("#0accc4")
            .addFields(
                { name: 'PayPal Email', value: shopInfo.paypal_email || 'N/A', inline: true },
                { name: 'PayPal Method', value: shopInfo.paypal_method || 'N/A', inline: true },
                { name: 'PayPal Client ID', value: shopInfo.paypal_client_id || 'N/A', inline: true },
                { name: 'PayPal Client Secret', value: shopInfo.paypal_client_secret || 'N/A', inline: true },
                { name: 'PayPal Webhook ID', value: shopInfo.paypal_webhook_id || 'N/A', inline: true },
                { name: 'PayPal FF Method', value: shopInfo.paypalff_method || 'N/A', inline: true },
                { name: 'Stripe PayPal Integration', value: `${shopInfo.stripe_paypal}`, inline: true },
                { name: 'PayPal FF Email', value: shopInfo.paypalff_email || 'N/A', inline: true },
                { name: 'PayPal FF Currency', value: shopInfo.paypalff_currency || 'N/A', inline: true },
                { name: 'Cash App Cashtag', value: shopInfo.cashapp_cashtag || 'N/A', inline: true },
                { name: 'Cash App Email', value: shopInfo.cashapp_email || 'N/A', inline: true },
                { name: 'Venmo Tag', value: shopInfo.venmo_tag || 'N/A', inline: true },
                { name: 'Venmo Email', value: shopInfo.venmo_email || 'N/A', inline: true },
                { name: 'Square API Key', value: shopInfo.square_api_key || 'N/A', inline: true },
                { name: 'Square Location ID', value: shopInfo.square_location_id || 'N/A', inline: true }
            ),

        new EmbedBuilder()
            .setTitle("Shop Information - Additional Payment Details")
            .setColor("#0accc4")
            .addFields(
                { name: 'Tap API Key', value: shopInfo.tap_api_key || 'N/A', inline: true },
                { name: 'Amazon PS Merchant Identifier', value: shopInfo.amazonps_merchant_identifier || 'N/A', inline: true },
                { name: 'Amazon PS Access Code', value: shopInfo.amazonps_access_code || 'N/A', inline: true },
                { name: 'Amazon PS SHA Request Phrase', value: shopInfo.amazonps_sha_request_phrase || 'N/A', inline: true },
                { name: 'Amazon PS SHA Response Phrase', value: shopInfo.amazonps_sha_response_phrase || 'N/A', inline: true },
                { name: 'Crisp Website ID', value: shopInfo.crisp_website_id || 'N/A', inline: true }
            ),

        new EmbedBuilder()
            .setTitle("Shop Information - Fees")
            .setColor("#0accc4")
            .addFields(
                { name: 'PayPal Fee', value: shopInfo.paypal_fee || 'N/A', inline: true },
                { name: 'PayPal FF Fee', value: shopInfo.paypalff_fee || 'N/A', inline: true },
                { name: 'Stripe Fee', value: shopInfo.stripe_fee || 'N/A', inline: true },
                { name: 'Square Fee', value: shopInfo.square_fee || 'N/A', inline: true },
                { name: 'Bitcoin Fee', value: shopInfo.bitcoin_fee || 'N/A', inline: true },
                { name: 'Litecoin Fee', value: shopInfo.litecoin_fee || 'N/A', inline: true },
                { name: 'Cash App Fee', value: shopInfo.cashapp_fee || 'N/A', inline: true },
                { name: 'Venmo Fee', value: shopInfo.venmo_fee || 'N/A', inline: true },
                { name: 'Amazon PS Fee', value: shopInfo.amazonps_fee || 'N/A', inline: true },
                { name: 'Skrill Fee', value: shopInfo.skrill_fee || 'N/A', inline: true },
                { name: 'Mollie Fee', value: shopInfo.mollie_fee || 'N/A', inline: true },
                { name: 'SumUp Fee', value: shopInfo.sumup_fee || 'N/A', inline: true }
            ),

        new EmbedBuilder()
            .setTitle("Shop Information - Subscription & Termination")
            .setColor("#0accc4")
            .addFields(
                { name: 'Subscription End Time', value: shopInfo.subscription_end_time || 'N/A', inline: true },
                { name: 'Termination Reason', value: shopInfo.termination_reason || 'N/A', inline: true },
                { name: 'Terminated At', value: shopInfo.terminated_at || 'N/A', inline: true }
            ),

        new EmbedBuilder()
            .setTitle("Shop Information - Limits and Additional Settings")
            .setColor("#0accc4")
            .addFields(
                { name: 'Max Product Limit', value: `${shopInfo.max_product_limit}`, inline: true },
                { name: 'Max Variant Limit', value: `${shopInfo.max_variant_limit}`, inline: true },
                { name: 'Max User  Limit', value: `${shopInfo.max_user_limit}`, inline: true },
                { name: 'Valid Payment Methods', value: shopInfo.valid_payment_methods.join(', ') || 'N/A', inline: true },
                { name: 'Enable Automatic Feedback', value: `${shopInfo.enable_automatic_feedback}`, inline: true },
                { name: 'Is Subscribed', value: `${shopInfo.is_subscribed}`, inline: true },
                { name: 'Theme ID', value: `${shopInfo.theme_id}`, inline: true },
                { name: 'Deleted At', value: shopInfo.deleted_at || 'N/A', inline: true }
            )
    ];

    // Send all embeds in a single message
    await interaction.reply({ embeds });
  } else if (commandName === 'balances') {
    const shopId = getShopId(); // Set the Shop ID here
    const balances = await getPayoutBalances(shopId);
    const embed = new EmbedBuilder()
    .setTitle("Account Balances")
    .setColor("#0accc4")
    .addFields(
        {
            name: "Bitcoin (BTC)",
            value: `**BTC Amount:** ${balances.btc.btc}\n**USD Equivalent:** $${balances.btc.usd}`,
            inline: true
        },
        {
            name: "Litecoin (LTC)",
            value: `**LTC Amount:** ${balances.ltc.ltc}\n**USD Equivalent:** $${balances.ltc.usd}`,
            inline: true
        }
    );

await interaction.reply({ embeds: [embed] });
    

  } else if (commandName === 'deletecoupon') {
    const shopId = getShopId(); // Set the Shop ID here
    const couponId = interaction.options.getString('coupon_id');

    const deleteResponse = await deleteCoupon(shopId, couponId);
    
    // Check for errors in the response
    if (deleteResponse.error) {
        return await interaction.reply({ content: deleteResponse.error, ephemeral: true });
    }

    const embed = createEmbed('Coupon Deleted', `Successfully deleted coupon with ID: **${couponId} **.`);
    await interaction.reply({ embeds: [embed] });
  
  } else if (commandName === 'claimrole') {
    const orderId = interaction.options.getString('order_id');

    // Check if the role exists
    const role = interaction.guild.roles.cache.find(r => r.name === 'Customer');

    if (!role) {
        return await interaction.reply({ content: 'The role "Customer" does not exist.', ephemeral: true });
    }

    // Check if the member already has the role
    if (interaction.member.roles.cache.has(role.id)) {
        return await interaction.reply({ content: 'You already have the Customer role.', ephemeral: true });
    }

    try {
        // Assign the role to the member
        await interaction.member.roles.add(role);
        const embed = createEmbed('Role Claimed', `You Have Successfully Claimed The Customer Role`);
        await interaction.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Error adding role:', error);
        await interaction.reply({ content: 'I could not assign the role. Please check my permissions and role hierarchy.', ephemeral: true });
    }
  } else if (commandName === 'createcoupon') {
    const shopId = interaction.options.getString('shop_id');
    const discount = interaction.options.getInteger('discount');
    const code = interaction.options.getString('code');
    const global = interaction.options.getBoolean('global');
    const type = interaction.options.getString('type');

    // Fetching coupon response
    const couponResponse = await createCoupon(shopId, discount, code, global, type);

    // Creating a more readable embed for coupon creation details
    const embed = new EmbedBuilder()
        .setTitle("🎟️ Coupon Created Successfully!")
        .setColor("#0accc4")
        .addFields(
            { name: "Coupon Code", value: `\`${couponResponse.code}\``, inline: true },
            { name: "Global", value: `${couponResponse.global ? "Yes" : "No"}`, inline: true },
            { name: "Discount", value: `${couponResponse.discount} ${couponResponse.type === "percentage" ? "%" : "USD"}`, inline: true },
            { name: "Type", value: `${couponResponse.type.charAt(0).toUpperCase() + couponResponse.type.slice(1)}`, inline: true },
            { name: "Shop ID", value: `\`${couponResponse.shop_id}\``, inline: true },
            { name: "Salt", value: `\`${couponResponse.salt}\``, inline: true },
            { name: "Created At", value: `<t:${Math.floor(new Date(couponResponse.created_at).getTime() / 1000)}:F>`, inline: false },
            { name: "Updated At", value: `<t:${Math.floor(new Date(couponResponse.updated_at).getTime() / 1000)}:F>`, inline: false },
            { name: "Coupon ID", value: `\`${couponResponse.id}\``, inline: false }
        )
        .setFooter({ text: "Coupon Creation", iconURL: "https://your-icon-url.com/icon.png" });

    await interaction.reply({ embeds: [embed] });
  }if (commandName === 'product') {
    const shopId = getShopId(); // Set the Shop ID here
    const productId = interaction.options.getString('product_id');
  
    // Defer the reply to allow time for the API call
    await interaction.deferReply();
  
    // Fetch the product details
    const productResponse = await getProductDetails( shopId, productId);
  
    // Check if there was an error in fetching the product
    if (!productResponse) {
      return await interaction.editReply({ content: '❌ Product not found. Please check the ID and try again.', ephemeral: true });
    }
  
    // Log the product response for debugging
    console.log('Product Response:', productResponse);
  
    // Prepare fields for the embed
    const fields = [
      { name: 'Name', value: productResponse.name || 'Unnamed Product', inline: true },
      { name: 'Price', value: productResponse.price ? `${productResponse.price} ${productResponse.currency || 'USD'}` : 'Not available', inline: true },
      //{ name: 'Description', value: productResponse.description ? productResponse.description.replace(/<[^>]*>/g, '') : 'No description available.', inline: false }, // Strip HTML tags
      { name: 'Stock Count', value: productResponse.stock_count !== undefined ? productResponse.stock_count.toString() : 'N/A', inline: true },
      { name: 'Visibility', value: productResponse.visibility ? 'Visible' : 'Hidden', inline: true },
    ];
  
    // Validate fields to ensure they are in the correct format
    const validatedFields = fields.map(field => {
      return {
        name: String(field.name).slice(0, 256), // Ensure name is a string and within limit
        value: String(field.value).slice(0, 1024), // Ensure value is a string and within limit
        inline: field.inline || false // Default to false if not provided
      };
    });
  
    // Add deliverables for the main product if available
    const productDeliverables = productResponse.deliverables && productResponse.deliverables.length > 0 
      ? productResponse.deliverables.join('\n') // Join with new line for non-variant products
      : 'No deliverables available.';
    validatedFields.push({ name: 'Deliverables', value: productDeliverables, inline: false });
  
    // Add variants to the embed
    if (productResponse.variants && productResponse.variants.length > 0) {
      validatedFields.push({ name: 'Variants', value: 'Here are the available variants:', inline: false });
  
      productResponse.variants.forEach(variant => {
        const variantPrice = variant.price ? `${variant.price} ${productResponse.currency || 'USD'}` : 'Price not available';
        const variantStock = variant.stock !== null ? (variant.stock !== undefined ? variant.stock.toString() : 'Stock not available') : 'Out of stock';
        const variantDeliverables = variant.deliverables && variant.deliverables.length > 0 
          ? variant.deliverables.join(', ') // Join with comma for variants
          : 'No deliverables available';
  
        validatedFields.push({ 
          name: variant.name, 
          value: `${variantPrice} | Stock: ${variantStock} | Deliverables: ${variantDeliverables}`, // Deliverables in a single line
          inline: true 
        });
      });
    } else {
      validatedFields.push({ name: 'Variants', value: 'No variants available.', inline: false });
    }
  
    // Create an embed for the product details
    const embed = createEmbed(
      `Product Details for ID: ${productResponse.id}`,
      `Here are the details for the product:`,
      validatedFields // Pass the prepared fields
    );
  
    // Reply with the embed
    await interaction.editReply({ embeds: [embed] });
  }
  else if (commandName === 'group') {
    const shopId = getShopId(); // Set the Shop ID here
    const groupId = interaction.options.getString('group_id');
  
    // Defer the reply to allow time for the API call
    await interaction.deferReply();
  
    const groupResponse = await getGroup(shopId, groupId);
  
    // Check for errors in fetching the group
    if (groupResponse.error) {
      return await interaction.editReply({ content: groupResponse.error, ephemeral: true });
    }
  
    // Ensure groupResponse is an object and contains necessary properties
    if (typeof groupResponse !== 'object' || !groupResponse.id) {
      return await interaction.editReply({ content: 'Invalid group data received.', ephemeral: true });
    }
  
    // Check the structure of the groupResponse
    console.log('Group Response:', groupResponse);
  
    // Prepare fields for the embed, ensuring all values are strings
    const productCount = Array.isArray(groupResponse.products) ? groupResponse.products.length : 0; // Count products if they are in an array
  
    const fields = [
      { name: 'Name', value: String(groupResponse.name || 'Unnamed Group'), inline: true },
      { name: 'ID', value: String (groupResponse.id), inline: true },
      { name: 'Product Count', value: String(productCount), inline: true }, // Use the counted value
      { name: 'Created At', value: String(new Date(groupResponse.created_at).toLocaleString()), inline: true },
    ];
  
    // Log fields to check the structure
    console.log('Fields for embed:', fields);
  
    // Create an embed for the group details
    const embed = createEmbed('Group Details', `Here are the details for group ID: **${groupResponse.id}**`, fields);
  
    // Reply with the embed
    await interaction.editReply({ embeds: [embed] });
  }
  else if (commandName === 'products') {
    const shopId = getShopId(); // Set the Shop ID here
    const page = interaction.options.getInteger('page') || 1; // Get page from options or default to 1
    const productsResponse = await getProducts(shopId, page);

    // Check if there was an error in fetching products
    if (productsResponse.error) {
        return await interaction.reply({ content: productsResponse.error, ephemeral: true });
    }

    // Log the productsResponse for debugging
    console.log(productsResponse); // Log the entire response to inspect the structure

    // Ensure that productsResponse contains a valid array
    if (!Array.isArray(productsResponse.data)) {
        return await interaction.reply({ content: 'No products found or invalid response structure.', ephemeral: true });
    }

    const fields = productsResponse.data.flatMap(product => {
        // Log each product for inspection
        console.log(product);

        // Check if the product has variants
        if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
            // If the product has variants, create an entry for each variant
            return product.variants.map(variant => {
                const variantPrice = variant.price !== null ? variant.price : 'Price not available'; // Ensure variant price is checked
                const variantCurrency = variant.currency || 'USD'; // Default currency if not provided
                const purchaseLength = variant.purchase_length || 'N/A'; // Get the purchase length option

                return {
                    name: `${product.name} - Purchase Length: ${purchaseLength}`, // Include purchase length
                    value: `Price: ${variantPrice} ${variantCurrency}\nID: ${variant.id || 'No ID available'}`,
                };
            });
        } else {
            // If there are no variants, show the main product price
            const price = product.price !== null ? product.price : 'Price not available'; // Ensure main product price is checked
            const currency = product.currency || 'USD'; // Default currency if not provided

            return [{
                name: product.name || 'Unnamed Product', // Handle unnamed products
                value: `Price: ${price} ${currency}\nID: ${product.id || 'No ID available'}`,
            }];
        }
    });

    const embed = createEmbed(`Products - Page ${page}`, 'Here are the products:', fields);
    await interaction.reply({ embeds: [embed] });
  }
});

// Login to Discord with your app's token
client.login(process.env.DISCORD_TOKEN);