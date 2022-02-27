import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:flutter/material.dart';
import 'package:nft_game/Screens/wallet_info.dart';

import '../Models/wallet_info.dart';
import '../Providers/auth.dart';
import '../Utils/wallets/phantom.dart';
import '../Utils/wallets/solflare.dart';
import '../Widgets/wallet_card.dart';

final walletTitle = StateProvider<String?>((ref) => null);

class HomePage extends HookConsumerWidget {
  static const routeName = '/home';

  const HomePage({Key? key}) : super(key: key);

  void _walletInfo(BuildContext context, String wallet) {
    Navigator.of(context).pushNamed(WalletInfo.routeName, arguments: wallet);
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final _auth = Auth();
    selectWallet(dynamic title) async {
      if (title == null) {
        return;
      }

      // Solflare CASE
      if (title == 'Solflare') {
        ref.watch(walletTitle).state = title;
        await ref.read(solflareWallet.notifier).connectWallet();
        final solflareType = dotenv.get('SOLFLARE_TYPE');
        if (ref.watch(solflareWallet) != null) {
          await _auth.getNonce(ref, solflareWallet);
        }
        if (ref.watch(nonce).state != null) {
          ref
              .read(solflareWallet.notifier)
              .signPlaintext(ref.watch(tokenValue).state ?? '')
              .then((signedMessage) async => {
                    print(signedMessage),
                    await _auth.completeAuth(ref, solflareWallet, solflareType,
                        signedMessage.toString())
                  });
        }
        _walletInfo(context, title);
        // Phantom CASE
      } else {
        // Change title
        ref.watch(walletTitle).state = title;
        // Connect to wallet
        await ref.read(phantomWallet.notifier).connectWallet();
        final phantomType = dotenv.get('PHANTOM_TYPE');
        if (ref.watch(phantomWallet) != null) {
          await _auth.getNonce(ref, phantomWallet);
        }
        if (ref.watch(nonce).state != null) {
          ref
              .read(phantomWallet.notifier)
              .signPlaintext(ref.watch(tokenValue).state ?? '')
              .then((signedMessage) async => {
                    print(signedMessage),
                    await _auth.completeAuth(ref, phantomWallet, phantomType,
                        signedMessage.toString())
                  });
        }
        _walletInfo(context, title);
      }
    }

    final _supportedWallets = [
      Walletinfo(
          title: 'Phantom',
          image: 'assets/images/phantom.png',
          installedTitle: ref.watch(hasPhantom)
              ? 'Connect to Phantom'
              : 'Please install Phantom',
          installed: ref.watch(hasPhantom)),
      Walletinfo(
          title: 'Solflare',
          image: 'assets/images/solflare.jpg',
          installedTitle: ref.watch(hasSolflare)
              ? 'Connect to Solflare'
              : 'Please install Solflare',
          installed: ref.watch(hasSolflare))
    ];

    final _cards = _supportedWallets
        .map((wallet) => WalletCard(
              title: wallet.title,
              image: wallet.image,
              installedTitle: wallet.installedTitle,
              installed: wallet.installed,
              selectWallet: selectWallet,
            ))
        .toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('NFT Game'),
      ),
      body: Container(
        alignment: Alignment.center,
        child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: _cards),
      ),
    );
  }
}
