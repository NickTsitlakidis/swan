import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../Utils/wallets/phantom.dart';
import '../Utils/wallets/solflare.dart';
import './homepage.dart';

class WalletInfo extends HookConsumerWidget {
  static const routeName = '/wallet_info';
  const WalletInfo({Key? key}) : super(key: key);

  Widget _info(String title, String content, BuildContext context) {
    return Row(mainAxisSize: MainAxisSize.min, children: [
      Text('$title: ', style: Theme.of(context).textTheme.headline5),
      Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            borderRadius: const BorderRadius.all(Radius.circular(5)),
            color: Theme.of(context).primaryColor,
          ),
          child: Text(content,
              overflow: TextOverflow.fade,
              style: Theme.of(context).textTheme.headline5))
    ]);
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    dynamic accountInfo;
    dynamic wallet;
    String? walletSelected = ref.watch(walletTitle).state;
    final bodyWidth = MediaQuery.of(context).size.width;
    if (walletSelected == 'Solflare') {
      wallet = solflareWallet;
      accountInfo = solflareAccountInfo;
    } else {
      wallet = phantomWallet;
      accountInfo = phantomAccountInfo;
    }
    final lamports = ref.watch(accountInfo).state?.lamports.toString() ?? '';
    final address = ref.watch(wallet)?.toBase58() ?? '';
    final previousTx = useState('');
    final previousSignedPlaintext = useState('');
    return Scaffold(
      appBar: AppBar(
        title: const Text('Wallet info'),
      ),
      body: Container(
        width: bodyWidth,
        padding: const EdgeInsets.all(15),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            _info('Address', address, context),
            const SizedBox(height: 10),
            _info('Balance', lamports, context),
            const SizedBox(height: 10),
            ElevatedButton(
              child: const Text('Airdrop'),
              onPressed: () => ref.read(wallet.notifier).requestAirdrop(),
            ),
            const SizedBox(height: 30),
            ElevatedButton(
              child: const Text('Refresh Account Info'),
              onPressed: () => ref.read(wallet.notifier).refreshAccountInfo(),
            ),
            const SizedBox(height: 30),
            ElevatedButton(
              child: const Text('Send Memo Transaction'),
              onPressed: () => ref
                  .read(wallet.notifier)
                  .confirmAndSendMemo('Hello world')
                  .then((txid) => previousTx.value = txid),
            ),
            const SizedBox(height: 10),
            _info('Previous Transaction', previousTx.value, context),
            const SizedBox(height: 30),
            _info('Previous Signed Message', previousSignedPlaintext.value,
                context),
            const SizedBox(height: 10),
            ElevatedButton(
                child: const Text('Sign utf8 plaintext'),
                onPressed: () => ref
                    .read(wallet.notifier)
                    .signPlaintext('d49d1c2c-904e-4d71-8661-fb3e9d0d6c99')
                    .then((signedMessage) => {
                          print(signedMessage),
                          previousSignedPlaintext.value = signedMessage
                        }))
          ],
        ),
      ),
    );
  }
}
